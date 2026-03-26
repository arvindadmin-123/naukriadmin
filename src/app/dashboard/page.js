// src/app/dashboard/page.js
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import styles from './dashboard.module.css';
import MobileSidebar from '../MobileSidebar';

const BLOG_ID = '4760900627062932844';
const POST_ID = '1971014663745817119';
const API_KEY = 'AIzaSyBcomLK77PJdaM7CXysztVxeAg8iVbF6c0';

async function getStats() {
  try {
    const res = await fetch(
      `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts/${POST_ID}?key=${API_KEY}`,
      { cache: 'no-store' }
    );
    const blogData = await res.json();
    const arr = JSON.parse(blogData.content);
    if (!Array.isArray(arr)) return { total: 0, categories: {}, latest: [] };

    const categories = {};
    arr.forEach((job) => {
      const cat = (job.category || 'other').toLowerCase();
      categories[cat] = (categories[cat] || 0) + 1;
    });

    const latest = arr.slice(0, 10);
    return { total: arr.length, categories, latest };
  } catch {
    return { total: 0, categories: {}, latest: [] };
  }
}

export default async function Dashboard() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get('admin_auth')?.value === 'true';
  if (!isLoggedIn) redirect('/');

  const { total, categories, latest } = await getStats();

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