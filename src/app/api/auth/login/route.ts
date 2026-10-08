import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { UserRepository } from '@/lib/repositories/user.repository';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

import { checkRateLimit, getIP } from '@/lib/rateLimit';

export async function POST(req: Request) {
  try {
    const ip = getIP(req);
    if (!checkRateLimit(ip, 10, 60000)) { // 10 requests per minute
      return NextResponse.json({ error: 'Too many login attempts. Please try again later.' }, { status: 429 });
    }

    let { email, password, role: requestedRole } = await req.json();

    // STRICT TYPE CASTING TO PREVENT NOSQL INJECTIONS
    email = String(email);
    password = String(password);
    requestedRole = String(requestedRole);

    if (!email || !password || !requestedRole || email === "undefined") {
      return NextResponse.json({ error: 'Email, password, and account type are required.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    // Check if user exists
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'Account not found. Please sign up first.' }, { status: 401 });
    }

    if (user.isBlocked) {
      return NextResponse.json({ error: 'This account has been suspended by an administrator.' }, { status: 403 });
    }

    if (user.authProvider === 'google' && !user.password) {
      return NextResponse.json({ error: 'This account was created with Google. Please use "Continue with Google" to log in.' }, { status: 401 });
    }

    if (!user.isVerified) {
      return NextResponse.json({ error: 'Please verify your email before logging in.', requireVerification: true, email: user.email }, { status: 403 });
    }

    // Verify requested role matches actual role
    const isRequestingAdmin = requestedRole === 'instructor';
    const isActualAdmin = user.role === 'admin';
    
    if (isRequestingAdmin && !isActualAdmin) {
      return NextResponse.json({ error: 'This account does not have Teacher privileges.' }, { status: 403 });
    }
    if (!isRequestingAdmin && isActualAdmin) {
      return NextResponse.json({ error: 'Please select the Teacher role to log in to your account.' }, { status: 403 });
    }

    // Verify password
    if (!user.password) {
      return NextResponse.json({ error: 'This account was created with Google. Please use "Continue with Google" to log in.' }, { status: 401 });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Incorrect password. Please try again.' }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    // Create JWT Token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // Set cookie using Next.js App Router
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    // Update last login
    await UserRepository.updateLastLogin(user.id);

    return NextResponse.json({ message: 'Logged in successfully', role: user.role }, { status: 200 });
  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
