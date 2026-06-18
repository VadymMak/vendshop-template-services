'use client';

import type { Vertical } from '@prisma/client';
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

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Čakajúce',
  CONFIRMED: 'Potvrdené',
  COMPLETED: 'Dokončené',
  CANCELLED: 'Zrušené',
  NO_SHOW: 'Neprítomný',
  PROCESSING: 'Spracováva sa',
  SHIPPED: 'Odoslané',
  DELIVERED: 'Doručené',
};

export default function DashboardClient({
  vertical,
  stats,
  recentOrders,
  recentReservations,
  topProducts,
  upcomingAppointments = [],
  topMasters = [],
}: DashboardProps) {
  const isRestaurant = vertical === 'RESTAURANT';
  const isServices = vertical === 'SERVICES';

  return (
    <div className={styles.page}>
      <h1 className={styles.h1}>Prehľad</h1>

      <div className={styles.stats}>
        {isServices ? (
          <>
            <StatCard label="Dnešné rezervácie" value={stats.todayAppointments} />
            <StatCard label="Klienti" value={stats.clientCount} />
            <StatCard label="Recenzie" value={stats.reviewCount} />
            <StatCard label="Majstri" value={stats.masterCount} />
          </>
        ) : isRestaurant ? (
          <>
            <StatCard label="Jedál v menu" value={stats.products} />
            <StatCard label="Rezervácie dnes" value={stats.todayReservations} />
            <StatCard label="Čakajúce" value={stats.pendingReservations} />
            <StatCard label="Za týždeň" value={stats.weekReservations} />
          </>
        ) : (
          <>
            <StatCard label="Produkty" value={stats.products} />
            <StatCard label="Objednávky" value={stats.orders} />
            <StatCard label="Recenzie" value={stats.reviews} />
            <StatCard label="Tržby" value={0} />
          </>
        )}
      </div>

      <div className={styles.row}>
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>
            {isServices
              ? 'Najbližšie rezervácie'
              : isRestaurant
                ? 'Najbližšie rezervácie'
                : 'Posledné objednávky'}
          </h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {isServices ? (
                    <>
                      <th>Dátum</th>
                      <th>Čas</th>
                      <th>Klient</th>
                      <th>Služba</th>
                      <th>Stav</th>
                    </>
                  ) : isRestaurant ? (
                    <>
                      <th>Dátum</th>
                      <th>Čas</th>
                      <th>Hosť</th>
                      <th>Osôb</th>
                      <th>Stav</th>
                    </>
                  ) : (
                    <>
                      <th>č.</th>
                      <th>Zákazník</th>
                      <th>Suma</th>
                      <th>Stav</th>
                      <th>Dátum</th>
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
                      {isServices ? 'Žiadne rezervácie' : isRestaurant ? 'Žiadne rezervácie' : 'Žiadne objednávky'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>
            {isServices ? 'Najlepší majstri' : isRestaurant ? 'Najlepšie jedlá' : 'Najlepšie produkty'}
          </h2>
          <ul className={styles.top}>
            {isServices
              ? topMasters.map((m, i) => (
                  <li key={m.name} className={styles.topItem}>
                    <span className={styles.topRank}>{i + 1}</span>
                    <span className={styles.topImg}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.photo} alt="" />
                    </span>
                    <span className={styles.topName}>{m.name}</span>
                    <span className={styles.topSales}>{m.appointmentCount} rezervácií</span>
                  </li>
                ))
              : topProducts.map((p, i) => (
                  <li key={p.name} className={styles.topItem}>
                    <span className={styles.topRank}>{i + 1}</span>
                    <span className={styles.topImg}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image} alt="" />
                    </span>
                    <span className={styles.topName}>{p.name}</span>
                    <span className={styles.topSales}>
                      {p.sales} {isRestaurant ? 'recenzií' : 'predaní'}
                    </span>
                  </li>
                ))}
            {(isServices ? topMasters : topProducts).length === 0 && (
              <li className={styles.emptyCell}>Žiadne dáta</li>
            )}
          </ul>
        </section>
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
