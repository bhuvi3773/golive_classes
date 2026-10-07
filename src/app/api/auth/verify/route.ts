import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
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

    await connectToDatabase();

    const user = await User.findOne({ email });
    
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
      user.verificationAttempts += 1;
      await user.save();
      return NextResponse.json({ error: 'Invalid verification code.' }, { status: 400 });
    }

    // Success! Mark as verified
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpiresAt = undefined;
    user.verificationAttempts = 0;
    user.lastLoginAt = new Date();
    await user.save();

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    // Log the user in immediately
    const token = jwt.sign(
      { userId: user._id, role: user.role },
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
