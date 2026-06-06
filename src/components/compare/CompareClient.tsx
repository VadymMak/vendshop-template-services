'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useCompareStore } from '@/stores/useCompareStore';
import styles from './CompareClient.module.css';

export default function CompareClient() {
  const t = useTranslations('Header');
  const items = useCompareStore((s) => s.items);
  const toggle = useCompareStore((s) => s.toggle);
  const clear = useCompareStore((s) => s.clear);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    useCompareStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  const fmt = (price: number, currency: string) =>
    currency === '€'
      ? new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price)
      : new Intl.NumberFormat('uk-UA').format(price);

  return (
    <main className={styles.page}>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>{t('compare')} ({items.length}/4)</h1>
        {items.length > 0 && (
          <button type="button" className={styles.clearBtn} onClick={clear}>
            Clear all
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className={styles.empty}>No products to compare — add up to 4 from the catalog</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.labelCol} />
                {items.map((item) => (
                  <th key={item.id} className={styles.prodCol}>
                    <div className={styles.prodHeader}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.name} className={styles.prodImg} />
                      <Link href={`/product/${item.slug}`} className={styles.prodName}>
                        {item.name}
                      </Link>
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => toggle(item)}
                        aria-label="Remove from compare"
                      >
                        ✕
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={styles.label}>Brand</td>
                {items.map((item) => (
                  <td key={item.id} className={styles.cell}>{item.brand || '—'}</td>
                ))}
              </tr>
              <tr>
                <td className={styles.label}>Price</td>
                {items.map((item) => (
                  <td key={item.id} className={`${styles.cell} ${styles.priceCell}`}>
                    {fmt(item.price, item.currency)} {item.currency}
                  </td>
                ))}
              </tr>
              <tr>
                <td className={styles.label}>Rating</td>
                {items.map((item) => (
                  <td key={item.id} className={styles.cell}>
                    {item.rating} / 5 ({item.reviewCount})
                  </td>
                ))}
              </tr>
              <tr>
                <td className={styles.label}>In Stock</td>
                {items.map((item) => (
                  <td key={item.id} className={styles.cell}>
                    {item.inStock ? '✓ Yes' : '✗ No'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
