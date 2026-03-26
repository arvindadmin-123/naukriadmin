// src/app/MobileSidebar.js
'use client';
import { useState } from 'react';
import Link from 'next/link';
import styles from './dashboard/dashboard.module.css';

export default function MobileSidebar({ active }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={styles.mobileBar}>
        <span className={styles.mobileLogoText}>Sidhe<span>Naukri</span></span>
        <button className={styles.menuBtn} onClick={() => setOpen(prev => !prev)}>
          <span /><span /><span />
        </button>
      </div>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 99,
          }}
        />
      )}

      {open && (
        <aside style={{
          position: 'fixed', top: 0, left: 0,
          height: '100vh', width: '260px',
          background: '#1a3fa3',
          display: 'flex', flexDirection: 'column',
          padding: '24px 0', zIndex: 100,
        }}>
          <div className={styles.sidebarLogo}>
            <span className={styles.logoText}>Sidhe<span>Naukri</span></span>
            <span className={styles.logoSub}>Admin</span>
          </div>
          <nav className={styles.nav}>
            <Link href="/dashboard" className={`${styles.navLink} ${active === 'dashboard' ? styles.active : ''}`} onClick={() => setOpen(false)}>📊 Dashboard</Link>
            <Link href="/new-post" className={`${styles.navLink} ${active === 'new-post' ? styles.active : ''}`} onClick={() => setOpen(false)}>✏️ New Post</Link>
            <Link href="/posts" className={`${styles.navLink} ${active === 'posts' ? styles.active : ''}`} onClick={() => setOpen(false)}>📋 All Posts</Link>
            <Link href="/revalidate" className={`${styles.navLink} ${active === 'posts' ? styles.active : ''}`} onClick={() => setOpen(false)}>🔄 Revalidate</Link>
          </nav>
          <form action="/api/admin/logout" method="POST" className={styles.logoutWrap}>
            <button type="submit" className={styles.logoutBtn}>🚪 Logout</button>
          </form>
        </aside>
      )}
    </>
  );
}