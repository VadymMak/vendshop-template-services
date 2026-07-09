'use client';

import type { Vertical } from '@prisma/client';
import { useAdminLocale } from '@/hooks/useAdminLocale';
import { getAdminT } from '@/lib/admin-i18n';
import styles from './dashboard.module.css';

interface DashboardProps {
  vertical: Vertical;
  stats: {
    products: number;
    orders: number;
    reviews: number;
    todayReservations: number;
    pendingReservations: number;
    weekReservations: number;
    todayAppointments: number;
    clientCount: number;
    reviewCount: number;
    masterCount: number;
  };
  recentOrders: Array<{
    id: string;
    customer: string;
    total: string;
    status: string;
    date: string;
  }>;
  recentReservations: Array<{
    id: string;
    name: string;
    guests: number;
    time: string;
    status: string;
    date: string;
  }>;
  topProducts: Array<{
    name: string;
    sales: number;
    image: string;
  }>;
  upcomingAppointments?: Array<{
    id: string;
    clientName: string;
    service: string;
    timeSlot: string;
    status: string;
    date: string;
  }>;
  topMasters?: Array<{
    name: string;
    photo: string;
    appointmentCount: number;
  }>;
}

export default function DashboardClient({
  vertical,
  stats,
  recentOrders,
  recentReservations,
  topProducts,
  upcomingAppointments = [],
  topMasters = [],
}: DashboardProps) {
  const { locale } = useAdminLocale();
  const td = getAdminT(locale);
  const isRestaurant = vertical === 'RESTAURANT';
  const isServices = vertical === 'SERVICES';

  const STATUS_LABELS: Record<string, string> = {
    PENDING:    td.reservations.pending,
    CONFIRMED:  td.reservations.confirmed,
    COMPLETED:  td.reservations.completed,
    CANCELLED:  td.reservations.cancelled,
    NO_SHOW:    td.reservations.noShow,
    PROCESSING: td.dashboard.processing,
    SHIPPED:    td.dashboard.shipped,
    DELIVERED:  td.dashboard.delivered,
  };

  void topMasters;

  return (
    <div className={styles.page}>
      <h1 className={styles.h1}>{td.dashboard.title}</h1>

      <div className={styles.stats}>
        {isServices ? (
          <>
            <StatCard label={td.dashboard.todayAppointments} value={stats.todayAppointments} />
            <StatCard label={td.dashboard.totalClients} value={stats.clientCount} />
            <StatCard label={td.nav.reviews} value={stats.reviewCount} />
          </>
        ) : isRestaurant ? (
          <>
            <StatCard label={td.dashboard.menuItems} value={stats.products} />
            <StatCard label={td.dashboard.todayReservations} value={stats.todayReservations} />
            <StatCard label={td.reservations.pending} value={stats.pendingReservations} />
            <StatCard label={td.dashboard.thisWeek} value={stats.weekReservations} />
          </>
        ) : (
          <>
            <StatCard label={td.nav.products} value={stats.products} />
            <StatCard label={td.nav.orders} value={stats.orders} />
            <StatCard label={td.nav.reviews} value={stats.reviews} />
            <StatCard label={td.dashboard.revenue} value={0} />
          </>
        )}
      </div>

      <div className={isServices ? styles.rowFull : styles.row}>
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>
            {isServices || isRestaurant ? td.dashboard.recentBookings : td.dashboard.recentOrders}
          </h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {isServices ? (
                    <>
                      <th>{td.dashboard.date}</th>
                      <th>{td.dashboard.time}</th>
                      <th>{td.dashboard.client}</th>
                      <th>{td.dashboard.service}</th>
                      <th>{td.dashboard.status}</th>
                    </>
                  ) : isRestaurant ? (
                    <>
                      <th>{td.dashboard.date}</th>
                      <th>{td.dashboard.time}</th>
                      <th>{td.dashboard.guest}</th>
                      <th>{td.dashboard.guestCount}</th>
                      <th>{td.dashboard.status}</th>
                    </>
                  ) : (
                    <>
                      <th>{td.dashboard.orderNum}</th>
                      <th>{td.dashboard.customer}</th>
                      <th>{td.dashboard.amount}</th>
                      <th>{td.dashboard.status}</th>
                      <th>{td.dashboard.date}</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {isServices
                  ? upcomingAppointments.map((a) => (
                      <tr key={a.id}>
                        <td>{a.date}</td>
                        <td className={styles.time}>{a.timeSlot}</td>
                        <td>{a.clientName}</td>
                        <td>{a.service}</td>
                        <td>
                          <span className={`${styles.badge} ${styles[`badge${a.status}` as keyof typeof styles]}`}>
                            {STATUS_LABELS[a.status] ?? a.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  : isRestaurant
                    ? recentReservations.map((r) => (
                        <tr key={r.id}>
                          <td>{r.date}</td>
                          <td className={styles.time}>{r.time}</td>
                          <td>{r.name}</td>
                          <td>{r.guests}</td>
                          <td>
                            <span className={`${styles.badge} ${styles[`badge${r.status}` as keyof typeof styles]}`}>
                              {STATUS_LABELS[r.status] ?? r.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    : recentOrders.map((o) => (
                        <tr key={o.id}>
                          <td className={styles.orderId}>#{o.id.slice(-4)}</td>
                          <td>{o.customer}</td>
                          <td className={styles.sum}>{o.total}</td>
                          <td>
                            <span className={`${styles.badge} ${styles[o.status as keyof typeof styles]}`}>
                              {STATUS_LABELS[o.status] ?? o.status}
                            </span>
                          </td>
                          <td className={styles.date}>{o.date}</td>
                        </tr>
                      ))}
                {(isServices
                  ? upcomingAppointments
                  : isRestaurant
                    ? recentReservations
                    : recentOrders
                ).length === 0 && (
                  <tr>
                    <td colSpan={5} className={styles.emptyCell}>
                      {isServices || isRestaurant ? td.reservations.noReservations : td.dashboard.noOrders}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {!isServices && (
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>
              {isRestaurant ? td.dashboard.topDishes : td.dashboard.topProducts}
            </h2>
            <ul className={styles.top}>
              {topProducts.map((p, i) => (
                <li key={p.name} className={styles.topItem}>
                  <span className={styles.topRank}>{i + 1}</span>
                  <span className={styles.topImg}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt="" />
                  </span>
                  <span className={styles.topName}>{p.name}</span>
                  <span className={styles.topSales}>
                    {p.sales} {isRestaurant ? td.dashboard.reviewsUnit : td.dashboard.salesUnit}
                  </span>
                </li>
              ))}
              {topProducts.length === 0 && <li className={styles.emptyCell}>{td.common.noData}</li>}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statBody}>
        <span className={styles.statValue}>{value}</span>
        <span className={styles.statLabel}>{label}</span>
      </div>
    </div>
  );
}
