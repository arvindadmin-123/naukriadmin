// src/app/dashboard/page.js
'use client';
import { useEffect } from 'react';
// import { cookies } from 'next/headers';
import Link from 'next/link';
import { useAdminData } from '../context/AdminDataContext';
import styles from './dashboard.module.css';
import MobileSidebar from '../MobileSidebar';

export default function Dashboard() {
  const { posts, loading, error, fetchPosts } = useAdminData();

  // Pehli baar load karo — agar already fetched hai toh API call nahi hogi
  useEffect(() => { fetchPosts(); }, []);

  const total = posts?.length || 0;
  const categories = {};
  posts?.forEach(job => {
    const cat = (job.category || 'other').toLowerCase();
    categories[cat] = (categories[cat] || 0) + 1;
  });
  const latest = posts?.slice(0, 10) || [];

  const catConfig = [
    { key: 'jobs',        label: 'Jobs',       color: '#1a3fa3', bg: '#eef1fb' },
    { key: 'result',      label: 'Results',    color: '#e67e22', bg: '#fff3e0' },
    { key: 'admit-card',  label: 'Admit Card', color: '#1565c0', bg: '#e3f2fd' },
    { key: 'answer-key',  label: 'Answer Key', color: '#c62828', bg: '#fce4ec' },
    { key: 'syllabus',    label: 'Syllabus',   color: '#2e7d32', bg: '#e8f5e9' },
  ];

  return (
    <div className={styles.wrap}>
      <MobileSidebar active="dashboard" />

      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <span className={styles.logoText}>Sidhe<span>Naukri</span></span>
          <span className={styles.logoSub}>Admin</span>
        </div>
        <nav className={styles.nav}>
          <Link href="/dashboard" className={`${styles.navLink} ${styles.active}`}>📊 Dashboard</Link>
          <Link href="/new-post" className={styles.navLink}>✏️ New Post</Link>
          <Link href="/posts" className={styles.navLink}>📋 All Posts</Link>
          <Link href="/fetch-post" className={styles.navLink}>🔗 Fetch Post</Link>
          <Link href="/revalidate" className={styles.navLink}>🔄 Revalidate</Link>
        </nav>
        <form action="/api/admin/logout" method="POST" className={styles.logoutWrap}>
          <button type="submit" className={styles.logoutBtn}>🚪 Logout</button>
        </form>
      </aside>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Dashboard</h1>
        </div>

        {loading && <p style={{ color: '#888', fontFamily: 'var(--font-poppins)', fontSize: '0.9rem' }}>⏳ Loading...</p>}
        {error   && <p style={{ color: '#c0392b', fontFamily: 'var(--font-poppins)', fontSize: '0.9rem' }}>❌ {error}</p>}

        <div className={styles.statsGrid}>
          <div className={styles.statCard} style={{ borderTopColor: '#1a3fa3', background: '#eef1fb' }}>
            <span className={styles.statNum} style={{ color: '#1a3fa3' }}>{total}</span>
            <span className={styles.statLabel} style={{ color: '#1a3fa3' }}>Total Posts</span>
          </div>
          {catConfig.map((cat) => (
            <div key={cat.key} className={styles.statCard} style={{ borderTopColor: cat.color, background: cat.bg }}>
              <span className={styles.statNum} style={{ color: cat.color }}>{categories[cat.key] || 0}</span>
              <span className={styles.statLabel} style={{ color: cat.color }}>{cat.label}</span>
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <Link href="/new-post" className={styles.actionBtn}>✏️ Create New Post</Link>
          <Link href="/fetch-post" className={styles.actionBtn2}>🔍 Fetch & Edit Post</Link>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Latest 10 Posts</h2>
          <div className={styles.postList}>
            {latest.map((job) => (
              <div key={job.id} className={styles.postRow}>
                <div className={styles.postInfo}>
                  <span className={styles.postTitle}>{job.title}</span>
                  <span className={styles.postCat}>{job.category}</span>
                </div>
                <div className={styles.postActions}>
                  <Link href={`/edit-post/${job.id}`} className={styles.editBtn}>Edit</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}