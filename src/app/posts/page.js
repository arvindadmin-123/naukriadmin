// src/app/posts/page.js
'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAdminData } from '../context/AdminDataContext';
import MobileSidebar from '../MobileSidebar';
import styles from './posts.module.css';

const CATEGORIES = ['All', 'Jobs', 'result', 'admit-card', 'answer-key', 'syllabus'];

export default function PostsPage() {
  const { posts, loading, error, fetchPosts } = useAdminData();

  const [filtered, setFiltered] = useState([]);
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('All');
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  // Fetch on mount — agar already cached hai toh API call nahi hogi
  useEffect(() => { fetchPosts(); }, []);

  // Filter
  const applyFilter = useCallback(() => {
    if (!posts) return;
    let result = [...posts];
    if (category !== 'All') {
      result = result.filter(j => j.category?.toLowerCase() === category.toLowerCase());
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(j =>
        j.title?.toLowerCase().includes(q) ||
        j.organization?.toLowerCase().includes(q) ||
        j.id?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [posts, search, category]);

  useEffect(() => { applyFilter(); }, [applyFilter]);

  return (
    <div className={styles.wrap}>
      <MobileSidebar active="posts" />

      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <span className={styles.logoText}>Sidhe<span>Naukri</span></span>
          <span className={styles.logoSub}>Admin</span>
        </div>
        <nav className={styles.nav}>
          <Link href="/dashboard" className={styles.navLink}>📊 Dashboard</Link>
          <Link href="/new-post" className={styles.navLink}>✏️ New Post</Link>
          <Link href="/posts" className={`${styles.navLink} ${styles.active}`}>📋 All Posts</Link>
          <Link href="/fetch-post" className={styles.navLink}>🔗 Fetch Post</Link>
          <Link href="/revalidate" className={styles.navLink}>🔄 Revalidate</Link>
        </nav>
        <form action="/api/admin/logout" method="POST" className={styles.logoutWrap}>
          <button type="submit" className={styles.logoutBtn}>🚪 Logout</button>
        </form>
      </aside>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>All Posts</h1>
          <Link href="/new-post" className={styles.newBtn}>✏️ New Post</Link>
        </div>

        <div className={styles.toolbar}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by title, organization, ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className={styles.cats}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`${styles.catBtn} ${category === cat ? styles.catActive : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <p className={styles.count}>{filtered.length} posts found</p>

        {error && <div style={{ color: '#c0392b', padding: '12px', background: '#fdf0ee', borderRadius: '8px', marginBottom: '12px', fontFamily: 'var(--font-poppins)', fontSize: '0.85rem' }}>{error}</div>}

        {loading ? (
          <div className={styles.loading}>⏳ Loading...</div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>No posts found</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Organization</th>
                  <th>ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(job => (
                  <tr key={job.id}>
                    <td className={styles.tdTitle}>{job.title}</td>
                    <td><span className={styles.catTag}>{job.category}</span></td>
                    <td className={styles.tdOrg}>{job.organization || '—'}</td>
                    <td className={styles.tdId}>{job.id}</td>
                    <td>
                      <div className={styles.actions}>
                        <Link href={`/edit-post/${job.id}`} className={styles.editBtn}>Edit</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}