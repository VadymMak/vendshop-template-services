'use client';

import { useMemo, useState } from 'react';
import styles from './reviews.module.css';

type ReviewStatus = 'pending' | 'published' | 'rejected';

interface Review {
  id: string;
  productName: string;
  productSlug: string;
  productImage: string;
  customer: string;
  verified: boolean;
  rating: number;
  text: string;
  date: string;
  status: ReviewStatus;
  reply?: string;
}

const P = '/placeholder-product.svg';

const INITIAL_REVIEWS: Review[] = [
  { id: 'r1', productName: 'Дриль-шурупокрут Makita DF333DSAE', productSlug: 'makita-df333dsae', productImage: P, customer: 'Олександр Мельник', verified: true, rating: 5, text: 'Чудовий інструмент, працює відмінно! Батареї вистачає надовго, у руці лежить зручно. Рекомендую всім.', date: '30.05.2026', status: 'published', reply: 'Дякуємо за ваш відгук! Раді, що інструмент вам підійшов.' },
  { id: 'r2', productName: 'Перфоратор Bosch GBH 2-26 DRE', productSlug: 'bosch-gbh-2-26', productImage: P, customer: 'Тетяна Гриценко', verified: true, rating: 4, text: 'Хороший перфоратор, свердлить бетон без проблем. Єдине — трохи важкий для тривалої роботи.', date: '31.05.2026', status: 'pending' },
  { id: 'r3', productName: 'Кутова шліфмашина DeWalt DWE4157', productSlug: 'dewalt-dwe4157', productImage: P, customer: 'Віктор Савченко', verified: false, rating: 3, text: 'Очікував більшого за ці гроші. Працює, але вібрація відчутна.', date: '31.05.2026', status: 'pending' },
  { id: 'r4', productName: 'Гайковерт Milwaukee M18 FIW2F12', productSlug: 'milwaukee-m18-fiw2f12', productImage: P, customer: 'Ірина Левченко', verified: true, rating: 5, text: 'Потужний гайковерт, відкручує навіть прикипілі болти. Рекомендую для СТО!', date: '29.05.2026', status: 'published' },
  { id: 'r5', productName: 'Лобзик Metabo STEB 65 Quick', productSlug: 'metabo-steb-65', productImage: P, customer: 'Павло Руденко', verified: true, rating: 5, text: 'Точний рез, зручний у роботі, мало вібрує. Дуже задоволений покупкою.', date: '28.05.2026', status: 'published' },
  { id: 'r6', productName: 'Перфоратор Makita HR2470', productSlug: 'makita-hr2470', productImage: P, customer: 'Оксана Дмитренко', verified: false, rating: 2, text: 'Швидко зламався патрон, не задоволена якістю.', date: '27.05.2026', status: 'rejected' },
  { id: 'r7', productName: 'Шліфмашина Bosch GEX 40-150', productSlug: 'bosch-gex-40-150', productImage: P, customer: 'Микола Захарченко', verified: true, rating: 4, text: 'Добра шліфмашина за свою ціну, пил відводиться непогано.', date: '27.05.2026', status: 'published' },
  { id: 'r8', productName: 'Болгарка Milwaukee M18 FSAG125XB', productSlug: 'milwaukee-m18-fsag125xb', productImage: P, customer: 'Світлана Кравчук', verified: false, rating: 4, text: 'Поки що все добре, подивимось як покаже себе далі.', date: '26.05.2026', status: 'pending' },
];

// Store-wide aggregate rating stats (mock totals — separate from the moderation list below).
const TOTAL_REVIEWS = 156;
const AVG_RATING = 4.7;
const BREAKDOWN: { stars: number; count: number }[] = [
  { stars: 5, count: 89 },
  { stars: 4, count: 24 },
  { stars: 3, count: 10 },
  { stars: 2, count: 3 },
  { stars: 1, count: 2 },
];
const BREAKDOWN_TOTAL = BREAKDOWN.reduce((s, b) => s + b.count, 0);

type Filter = 'all' | ReviewStatus;
const FILTERS: { key: Filter; label: string; count: number }[] = [
  { key: 'all', label: 'Всі', count: TOTAL_REVIEWS },
  { key: 'pending', label: 'Очікують', count: 23 },
  { key: 'published', label: 'Опубліковані', count: 128 },
  { key: 'rejected', label: 'Відхилені', count: 5 },
];

const STATUS_META: Record<ReviewStatus, string> = {
  pending: 'Очікує',
  published: 'Опубліковано',
  rejected: 'Відхилено',
};

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

function Stars({ value }: { value: number }) {
  return (
    <span className={styles.stars} aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i <= value ? '#f97316' : '#e5e7eb'} aria-hidden="true">
          <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 17.9 6.2 20.95l1.1-6.45-4.7-4.6 6.5-.95L12 2.5Z" />
        </svg>
      ))}
    </span>
  );
}

function CheckIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" {...stroke} aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>;
}
function XIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" {...stroke} aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>;
}
function ReplyIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" {...stroke} aria-hidden="true"><path d="M9 17H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-6l-4 4v-4Z" /></svg>;
}
function VerifiedIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" {...stroke} aria-hidden="true"><path d="M12 2.5 4.5 5.5v5c0 4.6 3.2 8.4 7.5 10 4.3-1.6 7.5-5.4 7.5-10v-5L12 2.5Z" /><path d="M8.8 12.2l2.2 2.2 4.2-4.4" /></svg>;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [filter, setFilter] = useState<Filter>('all');
  const [replyOpen, setReplyOpen] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const filtered = useMemo(
    () => (filter === 'all' ? reviews : reviews.filter((r) => r.status === filter)),
    [reviews, filter],
  );

  const setStatus = (id: string, status: ReviewStatus) =>
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));

  const openReply = (r: Review) => {
    setReplyOpen(r.id);
    setReplyText(r.reply ?? '');
  };

  const sendReply = (id: string) => {
    console.log('[admin review reply]', { id, text: replyText });
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, reply: replyText } : r)));
    setReplyOpen(null);
    setReplyText('');
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.h1}>Відгуки</h1>
          <div className={styles.filters}>
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                className={`${styles.filter} ${filter === f.key ? styles.filterActive : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label} <span className={styles.filterCount}>({f.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Rating summary */}
        <div className={styles.summary}>
          <div className={styles.avg}>
            <span className={styles.avgNum}>{AVG_RATING.toFixed(1)}</span>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#f97316" aria-hidden="true">
              <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 17.9 6.2 20.95l1.1-6.45-4.7-4.6 6.5-.95L12 2.5Z" />
            </svg>
          </div>
          <div className={styles.breakdown}>
            {BREAKDOWN.map((b) => (
              <div key={b.stars} className={styles.bdRow}>
                <span className={styles.bdLabel}>{b.stars}★</span>
                <span className={styles.bdBar}>
                  <span className={styles.bdFill} style={{ width: `${(b.count / BREAKDOWN_TOTAL) * 100}%` }} />
                </span>
                <span className={styles.bdCount}>{b.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews list */}
      <div className={styles.list}>
        {filtered.map((r) => (
          <article key={r.id} className={styles.card}>
            <div className={styles.cardTop}>
              <a className={styles.product} href={`/uk/product/${r.productSlug}`}>
                <span className={styles.productImg}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.productImage} alt="" />
                </span>
                <span className={styles.productName}>{r.productName}</span>
              </a>
              <span className={styles.date}>{r.date}</span>
            </div>

            <div className={styles.cardMid}>
              <div className={styles.customerRow}>
                <span className={styles.customer}>{r.customer}</span>
                {r.verified && (
                  <span className={styles.verified}>
                    <VerifiedIcon />
                    Верифікований покупець
                  </span>
                )}
              </div>
              <Stars value={r.rating} />
              <p className={styles.text}>{r.text}</p>
              {r.reply && (
                <div className={styles.existingReply}>
                  <span className={styles.replyLabel}>Ваша відповідь:</span>
                  {r.reply}
                </div>
              )}
            </div>

            <div className={styles.cardBottom}>
              <span className={`${styles.statusBadge} ${styles[r.status]}`}>{STATUS_META[r.status]}</span>
              <div className={styles.actions}>
                <button type="button" className={styles.publish} onClick={() => setStatus(r.id, 'published')} disabled={r.status === 'published'}>
                  <CheckIcon />
                  Опублікувати
                </button>
                <button type="button" className={styles.reject} onClick={() => setStatus(r.id, 'rejected')} disabled={r.status === 'rejected'}>
                  <XIcon />
                  Відхилити
                </button>
                <button type="button" className={styles.reply} onClick={() => openReply(r)}>
                  <ReplyIcon />
                  Відповісти
                </button>
              </div>
            </div>

            {replyOpen === r.id && (
              <div className={styles.replyBox}>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  placeholder="Ваша відповідь..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <div className={styles.replyActions}>
                  <button type="button" className={styles.replyCancel} onClick={() => setReplyOpen(null)}>
                    Скасувати
                  </button>
                  <button type="button" className={styles.replySend} onClick={() => sendReply(r.id)}>
                    Надіслати відповідь
                  </button>
                </div>
              </div>
            )}
          </article>
        ))}
        {filtered.length === 0 && <div className={styles.empty}>Відгуків не знайдено</div>}
      </div>
    </div>
  );
}
