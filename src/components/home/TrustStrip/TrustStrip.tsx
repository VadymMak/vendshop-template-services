'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { useVerticalConfig } from '@/lib/vertical-context';
import styles from './TrustStrip.module.css';

// Shared stroke attributes for the line icons (matches the design prototype).
const strokeProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function TruckIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" {...strokeProps} aria-hidden="true">
      <path d="M3 6.5h11v9H3zM14 9.5h4l3 3v3h-7z" />
      <circle cx="7" cy="17.5" r="1.6" />
      <circle cx="17.5" cy="17.5" r="1.6" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" {...strokeProps} aria-hidden="true">
      <path d="M12 2.5 4.5 5.5v5c0 4.6 3.2 8.4 7.5 10 4.3-1.6 7.5-5.4 7.5-10v-5L12 2.5Z" />
      <path d="M8.8 12.2l2.2 2.2 4.2-4.4" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" {...strokeProps} aria-hidden="true">
      <rect x="2.5" y="5.5" width="19" height="13" rx="2" />
      <path d="M2.5 9.5h19M6 14.5h4" />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" {...strokeProps} aria-hidden="true">
      <path d="M3.5 12a8.5 8.5 0 1 0 2.7-6.2" />
      <path d="M3.5 4v4h4" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" {...strokeProps} aria-hidden="true">
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34M17 8c2-1 4 0 4.5 2s-.5 6-3.5 8c-3 2-7 1.5-10-1" />
    </svg>
  );
}

function ClockIconLg() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" {...strokeProps} aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 6.5v6l3.5 2" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" {...strokeProps} aria-hidden="true">
      <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 17.9l-5.8 2.55 1.1-6.45-4.7-4.6 6.5-.95L12 2.5Z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" {...strokeProps} aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

type TrustItem = { id: string; titleKey: string; descKey: string; icon: ReactNode };

const ECOMMERCE_ITEMS: TrustItem[] = [
  { id: 'freeDelivery', titleKey: 'freeDelivery', descKey: 'freeDeliveryDesc', icon: <TruckIcon /> },
  { id: 'guarantee',    titleKey: 'guarantee',    descKey: 'guaranteeDesc',    icon: <ShieldIcon /> },
  { id: 'payment',      titleKey: 'payment',      descKey: 'paymentDesc',      icon: <CardIcon /> },
  { id: 'returns',      titleKey: 'returns',      descKey: 'returnsDesc',      icon: <ReturnIcon /> },
];

const RESTAURANT_ITEMS: TrustItem[] = [
  { id: 'freshIngredients', titleKey: 'freshIngredients', descKey: 'freshIngredientsDesc', icon: <LeafIcon /> },
  { id: 'fastDelivery',     titleKey: 'fastDelivery',     descKey: 'fastDeliveryDesc',     icon: <ClockIconLg /> },
  { id: 'awardWinning',     titleKey: 'awardWinning',     descKey: 'awardWinningDesc',     icon: <StarIcon /> },
  { id: 'freeBooking',      titleKey: 'freeBooking',      descKey: 'freeBookingDesc',      icon: <CalendarIcon /> },
];

/**
 * "Trust Strip" — a row of four reassurance items (delivery, warranty,
 * payment, returns) shown near the bottom of the home page.
 */
export default function TrustStrip() {
  const t = useTranslations('trust');
  const vConfig = useVerticalConfig();

  const isRestaurant = vConfig.vertical === 'RESTAURANT' || vConfig.vertical === 'FOOD_MARKET';
  const items = isRestaurant ? RESTAURANT_ITEMS : ECOMMERCE_ITEMS;

  return (
    <section className={`${styles.section} ${isRestaurant ? styles.sectionDark : ''}`}>
      <div className={styles.wrap}>
        {items.map((item) => (
          <div className={styles.item} key={item.id}>
            <span className={styles.icon} aria-hidden="true">
              {item.icon}
            </span>
            <div className={styles.text}>
              <span className={styles.title}>{t(item.titleKey)}</span>
              <span className={styles.desc}>{t(item.descKey)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
