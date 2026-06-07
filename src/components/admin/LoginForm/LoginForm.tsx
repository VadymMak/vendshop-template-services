'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './LoginForm.module.css';

function BoltLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

function RestaurantLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
    </svg>
  );
}

function MarketLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0 0 20 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
    </svg>
  );
}

function EyeIcon({ off }: { off?: boolean }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return off ? (
    <svg width="18" height="18" viewBox="0 0 24 24" {...p} aria-hidden="true"><path d="M2 12s3.5-7 10-7c2 0 3.7.6 5.2 1.5M22 12s-3.5 7-10 7c-2 0-3.7-.6-5.2-1.5" /><path d="M3 3l18 18" /></svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" {...p} aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
  );
}

interface LoginFormProps {
  storeName: string;
  vertical: string;
}

export default function LoginForm({ storeName, vertical }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(false);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const LogoIcon = vertical === 'RESTAURANT' ? RestaurantLogo
    : vertical === 'FOOD_MARKET' ? MarketLogo
    : BoltLogo;

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.logoIcon}>
            <LogoIcon />
          </span>
          <span className={styles.logoText}>{storeName}</span>
        </div>
        <h1 className={styles.title}>Адмін панель</h1>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <label className={styles.field}>
            <span className={styles.label}>Email</span>
            <input
              className={`${styles.input} ${error ? styles.inputError : ''}`}
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(false); }}
              autoComplete="username"
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Пароль</span>
            <div className={styles.masked}>
              <input
                className={`${styles.input} ${error ? styles.inputError : ''}`}
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                autoComplete="current-password"
                required
              />
              <button type="button" className={styles.eye} onClick={() => setShowPw((s) => !s)} aria-label="Показати або приховати пароль">
                <EyeIcon off={showPw} />
              </button>
            </div>
          </label>

          {error && <p className={styles.error}>Невірний email або пароль</p>}

          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? 'Вхід…' : 'Увійти'}
          </button>
        </form>
      </div>
    </div>
  );
}
