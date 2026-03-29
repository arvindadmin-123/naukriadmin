// src/app/revalidate/page.js  (Admin Panel)
'use client';
import { useState } from 'react';
import Link from 'next/link';
import MobileSidebar from '../MobileSidebar';
import styles from '../dashboard/dashboard.module.css';

const CATEGORIES = ['Jobs', 'result', 'admit-card', 'answer-key', 'syllabus'];

function getPrefix(cat) {
  const c = (cat || '').toLowerCase();
  if (c === 'result')     return 'result';
  if (c === 'admit-card') return 'admit-card';
  if (c === 'answer-key') return 'answer-key';
  if (c === 'syllabus')   return 'syllabus';
  return 'jobs';
}

export default function RevalidatePage() {
  const [postId, setPostId]   = useState('');
  const [cat, setCat]         = useState('Jobs');
  const [status, setStatus]   = useState('idle');
  const [message, setMessage] = useState('');

  const handleRevalidate = async () => {
    if (!postId.trim()) { setMessage('❌ Post ID daalo!'); setStatus('error'); return; }
    setStatus('loading'); setMessage('');
    const prefix = getPrefix(cat);
    const paths = ['/', '/search', `/${prefix}`, `/${prefix}/${postId.trim()}`];
    try {
      const res = await fetch('/api/admin/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setMessage(`✅ Done! ${paths.join(', ')} revalidate ho gayi।`);
        setPostId('');
      } else {
        setStatus('error');
        setMessage('❌ Failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      setStatus('error');
      setMessage('❌ Error: ' + err.message);
    }
  };

  const isLoading = status === 'loading';

  return (
    <div className={styles.wrap}>
      <MobileSidebar active="revalidate" />

      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <span className={styles.logoText}>Sidhe<span>Naukri</span></span>
          <span className={styles.logoSub}>Admin</span>
        </div>
        <nav className={styles.nav}>
          <Link href="/dashboard" className={styles.navLink}>📊 Dashboard</Link>
          <Link href="/new-post" className={styles.navLink}>✏️ New Post</Link>
          <Link href="/posts" className={styles.navLink}>📋 All Posts</Link>
          <Link href="/fetch-post" className={styles.navLink}>🔗 Fetch Post</Link>

          <Link href="/revalidate" className={`${styles.navLink} ${styles.active}`}>🔄 Revalidate</Link>
        </nav>
        <form action="/api/admin/logout" method="POST" className={styles.logoutWrap}>
          <button type="submit" className={styles.logoutBtn}>🚪 Logout</button>
        </form>
      </aside>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>🔄 Revalidate Site</h1>
        </div>

        <p style={{ color: '#666', fontSize: '0.88rem', marginBottom: '20px', fontFamily: 'var(--font-poppins)', background: '#fff3e0', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ffcc80' }}>
          💡 Post add karne ya edit karne ke baad Post ID aur Category daalo — Home, Search, Category aur Post page revalidate ho jaayenge। (4 writes)
        </p>

        {message && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontFamily: 'var(--font-poppins)', fontSize: '0.85rem', fontWeight: '600', background: status === 'success' ? '#e8f5e9' : '#fdf0ee', color: status === 'success' ? '#2e7d32' : '#c0392b', border: `1px solid ${status === 'success' ? '#a5d6a7' : '#f5c6c0'}` }}>
            {message}
          </div>
        )}

        <div style={{ background: '#fff', border: '1px solid #e0e4ee', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ background: '#1a3fa3', padding: '10px 16px', color: '#fff', fontWeight: '700', fontSize: '0.92rem', fontFamily: 'var(--font-poppins)' }}>
            🔄 Post Revalidate — New Post / Edit Post
          </div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                value={postId}
                onChange={e => setPostId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRevalidate()}
                placeholder="Post ID — ssc-gd-constable-2026"
                style={{ flex: 1, minWidth: '220px', padding: '10px 14px', border: '1.5px solid #d0d5e8', borderRadius: '8px', fontSize: '0.88rem', fontFamily: 'var(--font-poppins)', outline: 'none', color: '#333' }}
              />
              <select
                value={cat}
                onChange={e => setCat(e.target.value)}
                style={{ flex: '0 0 150px', padding: '10px 14px', border: '1.5px solid #d0d5e8', borderRadius: '8px', fontSize: '0.88rem', fontFamily: 'var(--font-poppins)', outline: 'none', color: '#333', cursor: 'pointer' }}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button
                onClick={handleRevalidate}
                disabled={isLoading || !postId.trim()}
                style={{ padding: '10px 24px', background: isLoading || !postId.trim() ? '#ccc' : '#1a3fa3', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.88rem', fontWeight: '700', cursor: isLoading || !postId.trim() ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-poppins)', whiteSpace: 'nowrap' }}
              >
                {isLoading ? '⏳ Revalidating...' : '🔄 Revalidate'}
              </button>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#888', fontFamily: 'var(--font-poppins)', marginTop: '-4px' }}>
              Revalidate hoga: <strong>/</strong>, <strong>/search</strong>, <strong>/{getPrefix(cat)}</strong>, <strong>/{getPrefix(cat)}/{postId || 'post-id'}</strong>
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}