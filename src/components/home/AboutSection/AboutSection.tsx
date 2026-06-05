'use client';

import { useTranslations } from 'next-intl';
import styles from './AboutSection.module.css';

export default function AboutSection() {
  const t = useTranslations('About');

  return (
    <div className={styles.about}>
      <div className={styles.inner}>
        <div className={styles.content}>
          <span className={styles.label}>{t('label')}</span>
          <h2 className={styles.title}>{t('title')}</h2>
          <p className={styles.text}>{t('text')}</p>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>15+</span>
              <span className={styles.statLabel}>{t('yearsLabel')}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>200+</span>
              <span className={styles.statLabel}>{t('dishesLabel')}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>50k+</span>
              <span className={styles.statLabel}>{t('guestsLabel')}</span>
            </div>
          </div>
        </div>

        <div className={styles.imageWrap}>
          <div className={styles.placeholder}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>Chef &amp; Team</span>
          </div>
        </div>
      </div>
    </div>
  );
}
