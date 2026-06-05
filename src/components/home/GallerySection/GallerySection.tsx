'use client';

import { useTranslations } from 'next-intl';
import styles from './GallerySection.module.css';

const GALLERY_IMAGES = [
  { src: '/images/gallery/gallery-1.jpg', alt: 'restaurant-interior' },
  { src: '/images/gallery/gallery-2.jpg', alt: 'signature-dish' },
  { src: '/images/gallery/gallery-3.jpg', alt: 'chef-at-work' },
  { src: '/images/gallery/gallery-4.jpg', alt: 'dining-area' },
  { src: '/images/gallery/gallery-5.jpg', alt: 'wine-collection' },
  { src: '/images/gallery/gallery-6.jpg', alt: 'dessert-plating' },
];

export default function GallerySection() {
  const t = useTranslations('Gallery');

  return (
    <div className={styles.gallery}>
      <div className={styles.header}>
        <span className={styles.label}>{t('label')}</span>
        <h2 className={styles.title}>{t('title')}</h2>
        <p className={styles.subtitle}>{t('subtitle')}</p>
      </div>

      <div className={styles.grid}>
        {GALLERY_IMAGES.map((img) => (
          <div key={img.alt} className={styles.item}>
            <div className={styles.placeholder}>
              {/* Placeholder — replace with real images when ready */}
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span className={styles.placeholderText}>{img.alt.replace(/-/g, ' ')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
