'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import styles from './GallerySection.module.css';

interface GalleryImage {
  id: string;
  url: string;
  alt: string;
}

const PlaceholderIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

export default function GallerySection() {
  const t = useTranslations('Gallery');
  const [images, setImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    fetch('/api/gallery')
      .then((res) => res.json() as Promise<{ images?: GalleryImage[] }>)
      .then((data) => setImages(data.images ?? []))
      .catch(() => {});
  }, []);

  return (
    <div className={styles.gallery}>
      <div className={styles.header}>
        <span className={styles.label}>{t('label')}</span>
        <h2 className={styles.title}>{t('title')}</h2>
        <p className={styles.subtitle}>{t('subtitle')}</p>
      </div>

      {images.length > 0 ? (
        <div className={styles.grid}>
          {images.map((img) => (
            <div key={img.id} className={styles.item}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.alt} className={styles.realImage} />
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.empty}>Галерея скоро буде наповнена</p>
      )}
    </div>
  );
}
