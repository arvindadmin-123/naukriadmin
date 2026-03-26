// src/app/page.js — Login Page
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  // Agar already logged in hai toh dashboard pe bhejo
  useEffect(() => {
    fetch('/api/admin/check-auth')
      .then(res => res.json())
      .then(data => {
        if (data.loggedIn) {
          router.replace('/dashboard');
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        router.replace('/dashboard');
      } else {
        setError('Wrong password! Please try again.');
      }
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1a3fa3 0%, #0d2470 100%)' }}>
      <div style={{ color: '#fff', fontFamily: 'var(--font-poppins)', fontSize: '1rem' }}>Loading...</div>
    </div>
  );

  return (
    <div className={styles.loginWrap}>
      <div className={styles.loginCard}>
        <div className={styles.logo}>
          <h1 className={styles.logoText}>Sidhe<span>Naukri</span></h1>
          <p className={styles.logoSub}>Admin Panel</p>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputWrap}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              className={styles.input}
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.btn} disabled={submitting}>
            {submitting ? 'Checking...' : 'Login →'}
          </button>
        </form>
      </div>
    </div>
  );
}