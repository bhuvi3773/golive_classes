import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const REDIRECT_URI = `${NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;

  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.json({ error: 'Google OAuth is not configured on the server.' }, { status: 500 });
  }

  // Generate a random state for CSRF protection
  const state = Math.random().toString(36).substring(7);

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
    `client_id=${GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=openid%20email%20profile` +
    `&access_type=offline` +
    `&state=${state}` +
    `&prompt=consent`;

  // We should ideally set a cookie with the state to verify it in the callback
  const response = NextResponse.redirect(authUrl);
  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 5, // 5 minutes
    path: '/',
  });

  return response;
}
