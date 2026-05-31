import type { ReactNode } from 'react';
import styles from './dashboard.module.css';

const ico = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/* ── Stat cards ─────────────────────────────────────── */
interface Stat {
  label: string;
  value: string;
  trend: string;
  up: boolean;
  tone: 'orange' | 'blue' | 'amber' | 'green';
  icon: ReactNode;
}

const STATS: Stat[] = [
  {
    label: 'Товарів',
    value: '87',
    trend: '+5',
    up: true,
    tone: 'orange',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" {...ico}>
        <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
        <path d="m3 8 9 5 9-5M12 13v8" />
      </svg>
    ),
  },
  {
    label: 'Замовлень',
    value: '23',
    trend: '+8%',
    up: true,
    tone: 'blue',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" {...ico}>
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="18" cy="20" r="1.5" />
        <path d="M2.5 3h2.2l2.2 12.2a1.5 1.5 0 0 0 1.5 1.2h8.8a1.5 1.5 0 0 0 1.5-1.2L21.5 7H6" />
      </svg>
    ),
  },
  {
    label: 'Відгуків',
    value: '156',
    trend: '+23',
    up: true,
    tone: 'amber',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" {...ico}>
        <path d="M12 3.5l2.6 5.3 5.9.85-4.25 4.15 1 5.85L12 17l-5.25 2.75 1-5.85L3.5 9.65l5.9-.85L12 3.5Z" />
      </svg>
    ),
  },
  {
    label: 'Виручка',
    value: '45 230 грн',
    trend: '-3%',
    up: false,
    tone: 'green',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" {...ico}>
        <rect x="2.5" y="6" width="19" height="12" rx="2" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    ),
  },
];

/* ── Recent orders ──────────────────────────────────── */
type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered';

const STATUS_LABEL: Record<OrderStatus, string> = {
  new: 'Новий',
  processing: 'Обробляється',
  shipped: 'Відправлено',
  delivered: 'Доставлено',
};

interface Order {
  id: string;
  customer: string;
  items: number;
  total: string;
  status: OrderStatus;
  date: string;
}

const ORDERS: Order[] = [
  { id: '1042', customer: 'Іван Петренко', items: 3, total: '8 940 грн', status: 'new', date: '31.05.2026' },
  { id: '1041', customer: 'Олена Коваль', items: 1, total: '5 749 грн', status: 'processing', date: '31.05.2026' },
  { id: '1040', customer: 'Андрій Шевченко', items: 2, total: '6 489 грн', status: 'shipped', date: '30.05.2026' },
  { id: '1039', customer: 'Марія Бондар', items: 5, total: '14 200 грн', status: 'delivered', date: '30.05.2026' },
  { id: '1038', customer: 'Сергій Ткаченко', items: 1, total: '2 990 грн', status: 'delivered', date: '29.05.2026' },
];

/* ── Top products ───────────────────────────────────── */
interface TopProduct {
  name: string;
  sales: number;
  image: string;
}

const TOP_PRODUCTS: TopProduct[] = [
  { name: 'Дриль-шурупокрут Makita DF333DSAE', sales: 48, image: '/placeholder-product.svg' },
  { name: 'Перфоратор Bosch GBH 2-26 DRE', sales: 41, image: '/placeholder-product.svg' },
  { name: 'Кутова шліфмашина DeWalt DWE4157', sales: 37, image: '/placeholder-product.svg' },
  { name: 'Лобзик Metabo STEB 65 Quick', sales: 29, image: '/placeholder-product.svg' },
  { name: 'Гайковерт Milwaukee M18 FIW2F12', sales: 24, image: '/placeholder-product.svg' },
];

export default function AdminDashboardPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.h1}>Дашборд</h1>

      {/* Stat cards */}
      <div className={styles.stats}>
        {STATS.map((s) => (
          <div key={s.label} className={styles.statCard}>
            <span className={`${styles.statIcon} ${styles[s.tone]}`}>{s.icon}</span>
            <div className={styles.statBody}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
            <span className={`${styles.trend} ${s.up ? styles.trendUp : styles.trendDown}`}>
              {s.trend}
            </span>
          </div>
        ))}
      </div>

      {/* Middle row */}
      <div className={styles.row}>
        {/* Recent orders */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Останні замовлення</h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>№</th>
                  <th>Покупець</th>
                  <th>Товари</th>
                  <th>Сума</th>
                  <th>Статус</th>
                  <th>Дата</th>
                </tr>
              </thead>
              <tbody>
                {ORDERS.map((o) => (
                  <tr key={o.id}>
                    <td className={styles.orderId}>#{o.id}</td>
                    <td>{o.customer}</td>
                    <td>{o.items}</td>
                    <td className={styles.sum}>{o.total}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[o.status]}`}>
                        {STATUS_LABEL[o.status]}
                      </span>
                    </td>
                    <td className={styles.date}>{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Top products */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Топ товари</h2>
          <ul className={styles.top}>
            {TOP_PRODUCTS.map((p, i) => (
              <li key={p.name} className={styles.topItem}>
                <span className={styles.topRank}>{i + 1}</span>
                <span className={styles.topImg}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt="" />
                </span>
                <span className={styles.topName}>{p.name}</span>
                <span className={styles.topSales}>{p.sales} продажів</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
