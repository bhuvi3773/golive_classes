import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    let { email } = await req.json();
    email = String(email);

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email });

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

    user.verificationCode = hashedOtp;
    user.verificationCodeExpiresAt = otpExpires;
    user.verificationAttempts = 0; // reset attempts for the new code
    await user.save();

    await sendVerificationEmail(email, otp);

    return NextResponse.json({ message: 'A new verification code has been sent.' }, { status: 200 });
  } catch (error: any) {
    console.error("Resend OTP Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
