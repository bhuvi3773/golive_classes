import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import bcrypt from 'bcryptjs';
import { UserRepository } from '@/lib/repositories/user.repository';
import crypto from 'crypto';
import { checkRateLimit, getIP } from '@/lib/rateLimit';

export async function POST(req: Request) {
  try {
    const ip = getIP(req);
    if (!checkRateLimit(ip, 5, 60000)) { // 5 requests per minute
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    let { token, password } = await req.json();
    token = String(token);
    password = String(password);

    if (!token || !password || password.length < 6) {
      return NextResponse.json({ error: 'Valid token and a password of at least 6 characters are required.' }, { status: 400 });
    }

    // Hash the input token to compare with DB
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await UserRepository.findByValidResetToken(resetTokenHash);

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired password reset token.' }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user and invalidate token
    await UserRepository.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpiresAt: null,
      isVerified: true
    });

    return NextResponse.json({ message: 'Password has been successfully reset.' }, { status: 200 });
  } catch (error: any) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
