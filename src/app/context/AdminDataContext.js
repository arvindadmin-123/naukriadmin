// src/app/context/AdminDataContext.js
'use client';
import { createContext, useContext, useState, useCallback, useRef } from 'react';

const BLOG_ID = '4760900627062932844';
const POST_ID = '1971014663745817119';
const API_KEY = 'AIzaSyBcomLK77PJdaM7CXysztVxeAg8iVbF6c0';

const AdminDataContext = createContext(null);

export function AdminDataProvider({ children }) {
  const [posts, setPosts]     = useState(null); // null = not fetched yet
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const fetchedRef            = useRef(false); // prevent double fetch

  const fetchPosts = useCallback(async (force = false) => {
    // Already fetched aur force nahi hai toh skip karo
    if (fetchedRef.current && !force) return;
    if (loading) return;

    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts/${POST_ID}?key=${API_KEY}`,
        { cache: 'no-store' }
      );
      const data = await res.json();
      const arr = JSON.parse(data.content);
      const result = Array.isArray(arr) ? arr : [];
      setPosts(result);
      fetchedRef.current = true;
    } catch (err) {
      setError('Data load failed: ' + err.message);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // Force refresh — revalidate ke baad use karo
  const refreshPosts = useCallback(() => {
    fetchedRef.current = false;
    fetchPosts(true);
  }, [fetchPosts]);

  return (
    <AdminDataContext.Provider value={{ posts, loading, error, fetchPosts, refreshPosts }}>
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error('useAdminData must be used inside AdminDataProvider');
  return ctx;
}