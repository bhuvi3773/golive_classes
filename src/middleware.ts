import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;

  const protectedRoutes = ['/my-learning', '/profile', '/profile-setup', '/admin'];
  
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    // Add cache control headers to prevent back-button caching issues on redirect
    const response = NextResponse.redirect(loginUrl);
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  }

  // Prevent logged in users from going back to login/register
  const authRoutes = ['/login', '/register'];
  const isAuthRoute = authRoutes.some(route => request.nextUrl.pathname.startsWith(route));
  
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const response = NextResponse.next();
  // Ensure protected routes are never cached by the browser
  if (isProtectedRoute) {
    response.headers.set('Cache-Control', 'no-store, max-age=0');
  }
  return response;
}

export const config = {
  matcher: [
    '/my-learning/:path*',
    '/profile/:path*',
    '/profile-setup/:path*',
    '/admin/:path*',
    '/login',
    '/register'
  ],
};
