// src/app/api/admin/revalidate/route.js  (Admin Panel)
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const SITE_URL          = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || 'sidhenaukri-secret-2026';

const BLOG_ID = '2842912977848904218';
const POST_ID = '3377912945921363783';
const API_KEY = 'AIzaSyALruA3pculIf5zjHeam_wq3fOHQSUJZ7o';

function getPrefix(cat) {
  const c = (cat || '').toLowerCase();
  if (c === 'result')     return 'result';
  if (c === 'admit-card') return 'admit-card';
  if (c === 'answer-key') return 'answer-key';
  if (c === 'syllabus')   return 'syllabus';
  return 'jobs';
}

async function isAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get('admin_auth')?.value === 'true';
}

async function getAllPostPaths() {
  try {
    const res = await fetch(
      `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts/${POST_ID}?key=${API_KEY}`,
      { cache: 'no-store' }
    );
    const data = await res.json();
    const arr = JSON.parse(data.content);
    if (!Array.isArray(arr)) return [];
    return arr.map(p => `/${getPrefix(p.category)}/${p.id}`);
  } catch {
    return [];
  }
}

export async function POST(request) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { paths, revalidateAll } = await request.json();

    let allPaths;

    if (revalidateAll) {
      const basePaths = ['/', '/jobs', '/result', '/admit-card', '/answer-key', '/syllabus', '/search'];
      const postPaths = await getAllPostPaths();
      allPaths = [...new Set([...basePaths, ...postPaths])];
    } else {
      allPaths = paths || ['/'];
    }

    const res = await fetch(`${SITE_URL}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: REVALIDATE_SECRET, paths: allPaths }),
    });

    const data = await res.json();

    if (!data.success) {
      return NextResponse.json({ error: data.error || 'Revalidation failed' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      revalidated: data.revalidated,
      total: allPaths.length,
    });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}