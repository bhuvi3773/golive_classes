import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import bcrypt from 'bcryptjs';
import { UserRepository } from '@/lib/repositories/user.repository';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';

import { checkRateLimit, getIP } from '@/lib/rateLimit';

export async function POST(req: Request) {
  try {
    const ip = getIP(req);
    if (!checkRateLimit(ip, 5, 60000)) { // 5 requests per minute
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    let { name, email, password, role: requestedRole } = await req.json();

    // STRICT TYPE CASTING TO PREVENT NOSQL INJECTIONS
    name = String(name);
    email = String(email);
    password = String(password);
    requestedRole = String(requestedRole);

    if (!name || !email || !password || email === "undefined") {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'Account already exists. Please login instead.' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with requested role (default to student, only super admin can promote to instructor)
    const role = 'student';

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Hash OTP before storing
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    const newUser = await UserRepository.create({
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: false,
      verificationCode: hashedOtp,
      verificationCodeExpiresAt: otpExpires,
      verificationAttempts: 0,
      authProvider: 'email',
    });

    // Send OTP via email
    await sendVerificationEmail(email, otp);

    return NextResponse.json(
      { message: 'Registration successful. Verification code sent.', email: newUser.email }, 
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
