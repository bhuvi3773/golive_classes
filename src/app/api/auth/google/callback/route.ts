import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    const cookieStore = await cookies();
    const savedState = cookieStore.get('oauth_state')?.value;

    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (!code) {
      return NextResponse.redirect(`${APP_URL}/login?error=OAuthCodeMissing`);
    }

    if (state !== savedState) {
      return NextResponse.redirect(`${APP_URL}/login?error=OAuthStateMismatch`);
    }

    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${APP_URL}/api/auth/google/callback`
    );

    const { tokens } = await client.getToken(code);
    const idToken = tokens.id_token;

    if (!idToken) {
      return NextResponse.redirect(`${APP_URL}/login?error=OAuthTokenError`);
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.redirect(`${APP_URL}/login?error=OAuthPayloadError`);
    }

    const { email, name, sub: googleId, picture } = payload;
    
    await connectToDatabase();
    
    // Account Linking Strategy
    let user = await User.findOne({ email });

    if (user) {
      // If user exists but is an email user, we could link or reject.
      // Standard practice: Link if verified, or just let them log in.
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google'; // Convert to Google auth
        user.isVerified = true; // Google verified them
      }
    } else {
      // New user
      user = await User.create({
        name: name || 'Google User',
        email,
        authProvider: 'google',
        googleId,
        isVerified: true, // Automatically verified via Google
        avatar: picture || '',
        role: 'student', // default
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    // Issue JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // Route to profile-setup if it's a brand new account, otherwise go to dashboard
    let dashboardPath = '/my-learning';
    if (user.role === 'superadmin') dashboardPath = '/superadmin';
    if (user.role === 'admin') dashboardPath = '/admin/courses';
    
    const redirectPath = !user.profileSetupCompleted ? '/profile-setup' : dashboardPath;
    const response = NextResponse.redirect(`${APP_URL}${redirectPath}`);
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
    
    // Clear oauth state
    response.cookies.delete('oauth_state');

    return response;

  } catch (error) {
    console.error('Google Callback Error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login?error=OAuthInternalError`);
  }
}
