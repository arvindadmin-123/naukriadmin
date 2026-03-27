// src/app/revalidate/page.js  (Admin Panel)
'use client';
import { useState } from 'react';
import Link from 'next/link';
import MobileSidebar from '../MobileSidebar';
import styles from '../dashboard/dashboard.module.css';

const BASE_PATHS = ['/', '/jobs', '/result', '/admit-card', '/answer-key', '/syllabus', '/search'];

export default function RevalidatePage() {
  const [status, setStatus]   = useState('idle');
  const [message, setMessage] = useState('');
  const [custom, setCustom]   = useState('');

  const handleRevalidate = async (paths, revalidateAll = false) => {
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('/api/admin/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths, revalidateAll }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setMessage(`✅ Done! ${data.total || data.revalidated?.length || 0} pages revalidate ho gayi।`);
      } else {
        setStatus('error');
        setMessage('❌ Failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      setStatus('error');
      setMessage('❌ Error: ' + err.message);
    }
  };

  const handleCustom = () => {
    if (!custom.trim()) return;
    const paths = custom.split(',').map(p => p.trim()).filter(Boolean);
    handleRevalidate(paths, false);
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

        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '24px', fontFamily: 'var(--font-poppins)' }}>
          Blogger mein data update karne ke baad yahan se site ka cache clear karo। Cache 1 hour ke liye set hoga।
        </p>

        {/* Status Message */}
        {message && (
          <div style={{
            padding: '14px 18px', borderRadius: '10px', marginBottom: '24px',
            fontFamily: 'var(--font-poppins)', fontSize: '0.9rem', fontWeight: '600',
            background: status === 'success' ? '#e8f5e9' : '#fdf0ee',
            color: status === 'success' ? '#2e7d32' : '#c0392b',
            border: `1px solid ${status === 'success' ? '#a5d6a7' : '#f5c6c0'}`,
          }}>
            {message}
          </div>
        )}

        {/* Main Buttons */}
        <div style={{ background: '#fff', border: '1px solid #e0e4ee', borderRadius: '10px', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ background: '#1a3fa3', padding: '10px 16px', color: '#fff', fontWeight: '700', fontSize: '0.92rem', fontFamily: 'var(--font-poppins)' }}>
            Quick Revalidate
          </div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* ✅ Revalidate All — saare post pages bhi */}
            <button
              onClick={() => handleRevalidate(BASE_PATHS, true)}
              disabled={isLoading}
              style={{
                padding: '14px 24px',
                background: isLoading ? '#ccc' : '#1a3fa3',
                color: '#fff', border: 'none', borderRadius: '8px',
                fontSize: '0.95rem', fontWeight: '700',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-poppins)',
              }}
            >
              {isLoading ? '⏳ Revalidating...' : '🔄 Revalidate All (Pages + Posts)'}
            </button>

       
          </div>
        </div>

     
      </main>
    </div>
  );
}