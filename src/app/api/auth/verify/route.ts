import { NextResponse } from 'next/server';
import { UserRepository } from '@/lib/repositories/user.repository';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

import { checkRateLimit, getIP } from '@/lib/rateLimit';

export async function POST(req: Request) {
  try {
    const ip = getIP(req);
    if (!checkRateLimit(ip, 10, 60000)) { // 10 requests per minute
      return NextResponse.json({ error: 'Too many verification attempts. Please try again later.' }, { status: 429 });
    }

    let { email, code } = await req.json();

    email = String(email);
    code = String(code);

    if (!email || !code || code.length !== 6) {
      return NextResponse.json({ error: 'Valid email and 6-digit code are required.' }, { status: 400 });
    }

    // Check if user exists
    const user = await UserRepository.findByEmail(email);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ error: 'Account is already verified.' }, { status: 400 });
    }

    // Check rate limit (max 5 attempts)
    if (user.verificationAttempts >= 5) {
      return NextResponse.json({ error: 'Too many failed attempts. Please request a new code.' }, { status: 429 });
    }

    // Check expiration
    if (!user.verificationCodeExpiresAt || new Date() > user.verificationCodeExpiresAt) {
      return NextResponse.json({ error: 'Verification code has expired. Please request a new one.' }, { status: 400 });
    }

    // Verify code
    const hashedInputOtp = crypto.createHash('sha256').update(code).digest('hex');
    
    if (user.verificationCode !== hashedInputOtp) {
      await UserRepository.update(user.id, { verificationAttempts: user.verificationAttempts + 1 });
      return NextResponse.json({ error: 'Invalid verification code.' }, { status: 400 });
    }

    // Success! Mark as verified
    await UserRepository.update(user.id, {
      isVerified: true,
      verificationCode: null,
      verificationCodeExpiresAt: null,
      verificationAttempts: 0,
      lastLoginAt: new Date()
    });

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    // Log the user in immediately
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      jwtSecret,
      { expiresIn: '7d' }
    );

    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return NextResponse.json({ message: 'Email verified successfully', role: user.role }, { status: 200 });
  } catch (error: any) {
    console.error("Verification Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
