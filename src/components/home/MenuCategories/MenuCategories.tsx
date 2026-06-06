'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import styles from './MenuCategories.module.css';

interface CategoryItem {
  slug: string;
  nameKey: string;
  image?: string;
  productCount: number;
}

interface MenuCategoriesProps {
  categories?: CategoryItem[];
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { slug: 'antipasti', nameKey: 'antipasti', productCount: 6 },
  { slug: 'primi',     nameKey: 'primi',     productCount: 4 },
  { slug: 'secondi',   nameKey: 'secondi',   productCount: 3 },
  { slug: 'pizza',     nameKey: 'pizza',     productCount: 4 },
  { slug: 'dolci',     nameKey: 'dolci',     productCount: 3 },
  { slug: 'bevande',   nameKey: 'bevande',   productCount: 3 },
];

export default function MenuCategories({ categories }: MenuCategoriesProps) {
  const t = useTranslations('menuCategories');
  const items = categories ?? DEFAULT_CATEGORIES;

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        {/* Section header */}
        <div className={styles.header}>
          <p className={styles.tagline}>{t('tagline')}</p>
          <h2 className={styles.title}>{t('title')}</h2>
          <p className={styles.subtitle}>{t('subtitle')}</p>
        </div>

        {/* Category grid */}
        <div className={styles.grid}>
          {items.map((cat) => (
            <Link
              key={cat.slug}
              href={`/catalog?category=${cat.slug}`}
              className={styles.card}
            >
              {cat.image ? (
                <Image
                  src={cat.image}
                  alt={t.has(cat.nameKey as Parameters<typeof t>[0]) ? t(cat.nameKey as Parameters<typeof t>[0]) : cat.nameKey}
                  fill
                  className={styles.cardImage}
                />
              ) : (
                <div className={styles.cardPlaceholder} />
              )}
              <div className={styles.cardOverlay} />
              <div className={styles.cardContent}>
                <p className={styles.cardName}>
                  {t.has(cat.nameKey as Parameters<typeof t>[0]) ? t(cat.nameKey as Parameters<typeof t>[0]) : cat.nameKey}
                </p>
                <p className={styles.cardCount}>
                  {cat.productCount} {t('dishes')}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* View all link */}
        <div className={styles.viewAll}>
          <Link href="/catalog" className={styles.viewAllLink}>
            {t('viewAll')} →
          </Link>
        </div>
      </div>
    </section>
  );
}
