import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import styles from './login.module.css';

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon} aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <h1 className={styles.title}>Sign In</h1>
        <p className={styles.subtitle}>Customer accounts coming soon.</p>
        <p className={styles.note}>
          Admin access?{' '}
          <Link href="/admin" className={styles.link}>
            Go to Admin Panel →
          </Link>
        </p>
      </div>
    </main>
  );
}
