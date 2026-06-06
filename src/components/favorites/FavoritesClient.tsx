'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useFavoritesStore } from '@/stores/useFavoritesStore';
import ProductCard from '@/components/catalog/ProductCard/ProductCard';
import styles from './FavoritesClient.module.css';

const noop = (_id: string) => {};

export default function FavoritesClient() {
  const t = useTranslations('Header');
  const items = useFavoritesStore((s) => s.items);
  const clear = useFavoritesStore((s) => s.clear);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    useFavoritesStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  return (
    <main className={styles.page}>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>{t('favorites')} ({items.length})</h1>
        {items.length > 0 && (
          <button type="button" className={styles.clearBtn} onClick={clear}>
            Clear all
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className={styles.empty}>No favorites yet — browse the catalog and click ♡</p>
      ) : (
        <div className={styles.grid}>
          {items.map((item) => (
            <ProductCard
              key={item.id}
              {...item}
              isHit={false}
              isNew={false}
              onAddToCart={noop}
            />
          ))}
        </div>
      )}
    </main>
  );
}
