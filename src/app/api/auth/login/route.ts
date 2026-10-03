import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
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

    await connectToDatabase();

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'Account not found. Please sign up first.' }, { status: 401 });
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
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Incorrect password. Please try again.' }, { status: 401 });
    }

    // Create JWT Token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Set cookie using Next.js App Router
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return NextResponse.json({ message: 'Logged in successfully', role: user.role }, { status: 200 });
  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
