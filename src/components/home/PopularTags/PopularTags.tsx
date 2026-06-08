'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import styles from './PopularTags.module.css';

// Brand tags → search by brand name via ?q=
// Category tags → filter by category slug via ?category=
interface TagItem {
  label: string;
  href: string;
}

const TAGS: TagItem[] = [
  { label: 'Makita', href: '/catalog?q=Makita' },
  { label: 'Bosch', href: '/catalog?q=Bosch' },
  { label: 'DeWalt', href: '/catalog?q=DeWalt' },
  { label: 'Milwaukee', href: '/catalog?q=Milwaukee' },
  { label: 'Metabo', href: '/catalog?q=Metabo' },
  { label: 'Перфоратор', href: '/catalog?category=perforators' },
  { label: 'Дриль', href: '/catalog?category=drills' },
  { label: 'Болгарка', href: '/catalog?category=grinders' },
  { label: 'Шурупокрут', href: '/catalog?category=drills' },
  { label: 'Акумуляторний інструмент', href: '/catalog?q=акумуляторний' },
  { label: 'Лазерний рівень', href: '/catalog?category=lasers' },
  { label: 'Професійний інструмент', href: '/catalog?q=професійний' },
  { label: 'Інструмент для дому', href: '/catalog?q=дому' },
];

export default function PopularTags() {
  const t = useTranslations('tags');

  return (
    <section className={styles.tags}>
      <div className={styles.inner}>
        <span className={styles.label}>{t('popularQueries')}</span>
        <div className={styles.row}>
          {TAGS.map((tag) => (
            <Link
              key={tag.label}
              href={tag.href}
              className={styles.tag}
            >
              {tag.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
