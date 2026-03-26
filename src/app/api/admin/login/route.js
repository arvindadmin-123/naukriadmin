// src/app/api/admin/login/route.js
import { NextResponse } from 'next/server';

const BLOG_ID = '2842912977848904218';
const POST_ID = '677255062058506731';
const API_KEY = 'AIzaSyALruA3pculIf5zjHeam_wq3fOHQSUJZ7o';

async function getPasswordFromBlogger() {
  try {
    const res = await fetch(
      `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts/${POST_ID}?key=${API_KEY}`,
      { cache: 'no-store' }
    );
    const data = await res.json();
    const json = JSON.parse(data.content);
    return json.password ? String(json.password) : null;
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    const { password } = await request.json();
    const correctPassword = await getPasswordFromBlogger();

    if (!correctPassword) {
      return NextResponse.json({ success: false, message: 'Could not fetch password' });
    }

    if (String(password) === correctPassword) {
      const response = NextResponse.json({ success: true });
      response.cookies.set('admin_auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
        sameSite: 'lax',
      });
      return response;
    }

    return NextResponse.json({ success: false, message: 'Wrong password' });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error: ' + err.message });
  }
}