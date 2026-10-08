import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { UserRepository } from '@/lib/repositories/user.repository';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email';
import { checkRateLimit, getIP } from '@/lib/rateLimit';

export async function POST(req: Request) {
  try {
    const ip = getIP(req);
    if (!checkRateLimit(ip, 3, 60000)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }
    let { email } = await req.json();
    email = String(email);

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const user = await UserRepository.findByEmail(email);

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ error: 'Account is already verified.' }, { status: 400 });
    }

    // Rate limiting logic: Check if last code was sent less than 1 minute ago
    if (user.verificationCodeExpiresAt) {
      // original expiry was 15 mins. If it expires in > 14 mins, it was just sent.
      const timeSinceLastSent = (15 * 60 * 1000) - (user.verificationCodeExpiresAt.getTime() - Date.now());
      if (timeSinceLastSent < 60 * 1000) { // less than 60s ago
        return NextResponse.json({ error: 'Please wait a minute before requesting another code.' }, { status: 429 });
      }
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    await UserRepository.update(user.id, {
      verificationCode: hashedOtp,
      verificationCodeExpiresAt: otpExpires,
      verificationAttempts: 0
    });

    await sendVerificationEmail(email, otp);

    return NextResponse.json({ message: 'A new verification code has been sent.' }, { status: 200 });
  } catch (error: any) {
    console.error("Resend OTP Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
