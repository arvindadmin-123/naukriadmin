// src/app/api/admin/logout/route.js
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'));
  response.cookies.set('admin_auth', '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
  });
  return response;
}