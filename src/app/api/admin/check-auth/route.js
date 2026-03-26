// src/app/api/admin/check-auth/route.js
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get('admin_auth')?.value === 'true';
  return NextResponse.json({ loggedIn: isLoggedIn });
}