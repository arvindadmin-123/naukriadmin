// middleware.js — project ROOT mein
import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get('admin_auth');
  const isLoggedIn = authCookie?.value === 'true';

  // Protected routes
  const protectedRoutes = ['/dashboard', '/new-post', '/posts', '/edit-post'];
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Agar logged in hai aur login page pe hai toh dashboard pe bhejo
  if (pathname === '/' && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/new-post/:path*', '/posts/:path*', '/edit-post/:path*'],
};