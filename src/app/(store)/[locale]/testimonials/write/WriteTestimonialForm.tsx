'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useCustomer } from '@/lib/useCustomer';
import styles from './write.module.css';

export default function WriteTestimonialForm() {
  const t = useTranslations('testimonials');
  const locale = useLocale();
  const { customer, loading } = useCustomer();

  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!loading && !customer) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>{t('writeReview')}</h1>
          <p className={styles.subtitle}>{t('registeredOnly')}</p>
          <div className={styles.actions}>
            <Link href="/register" className={styles.btn}>{t('registerToReview')}</Link>
            <Link href="/login" className={styles.link}>{t('alreadyRegistered')}</Link>
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <p>...</p>
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <div className={styles.successIcon} aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <h1 className={styles.title}>{t('successTitle')}</h1>
          <p className={styles.subtitle}>{t('successPending')}</p>
          <Link href="/testimonials" className={styles.btn}>{t('viewAll')}</Link>
        </div>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (text.trim().length < 20) {
      setError(t('errorTextShort'));
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), rating, locale }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to submit');
      } else {
        setSubmitted(true);
      }
    } catch {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>{t('writeReview')}</h1>
        <p className={styles.greeting}>{t('greeting', { name: customer!.name ?? customer!.email })}</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.ratingGroup}>
            <span className={styles.ratingLabel}>{t('ratingLabel')}</span>
            <div className={styles.starPicker}>
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  type="button"
                  className={(hoverRating || rating) >= v ? styles.starActive : styles.starInactive}
                  onMouseEnter={() => setHoverRating(v)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(v)}
                  aria-label={`${v} star${v > 1 ? 's' : ''}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <label className={styles.label}>
            <span className={styles.labelText}>{t('textLabel')}</span>
            <textarea
              className={styles.textarea}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('textPlaceholder')}
              minLength={20}
              maxLength={2000}
              rows={5}
              required
            />
            <span className={styles.charCount}>{text.length} / 2000</span>
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.btn} disabled={submitting}>
            {submitting ? '...' : t('submit')}
          </button>
        </form>

        <Link href="/testimonials" className={styles.backLink}>← {t('backToReviews')}</Link>
      </div>
    </main>
  );
}
