'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdminLocale } from '@/hooks/useAdminLocale';
import { getAdminT } from '@/lib/admin-i18n';
import styles from './history.module.css';

interface Master   { id: string; name: string }
interface Service  { id: string; nameKey: string }

interface Appointment {
  id:             string;
  guestName:      string | null;
  guestPhone:     string | null;
  date:           string;
  timeSlot:       string;
  status:         string;
  service:        string | null;
  priceAtBooking: number | null;
  servicePrice:   number | null;
  masterId:       string | null;
  master:         string | null;
  note:           string | null;
}

interface MasterSummary {
  name:    string;
  count:   number;
  revenue: number;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('sk-SK', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtEur(n: number | null) {
  if (n == null) return '—';
  return `€${n.toFixed(2)}`;
}

export default function HistoryPage() {
  const { locale } = useAdminLocale();
  const t = getAdminT(locale);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [masters,      setMasters]      = useState<Master[]>([]);
  const [services,     setServices]     = useState<Service[]>([]);
  const [loading,      setLoading]      = useState(true);

  // Filters
  const [masterId,  setMasterId]  = useState('');
  const [serviceId, setServiceId] = useState('');
  const [from,      setFrom]      = useState('');
  const [to,        setTo]        = useState('');
  const [status,    setStatus]    = useState('ALL');

  // Load masters + services once
  useEffect(() => {
    Promise.all([
      fetch('/api/masters').then((r) => r.json() as Promise<{ masters: Master[] }>),
      fetch('/api/services').then((r) => r.json() as Promise<{ services: Service[] }>),
    ]).then(([m, s]) => {
      setMasters(m.masters ?? []);
      setServices(s.services ?? []);
    }).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ scope: 'history' });
      if (masterId)          p.set('masterId',  masterId);
      if (serviceId)         p.set('serviceId', serviceId);
      if (from)              p.set('from',      from);
      if (to)                p.set('to',        to);
      if (status !== 'ALL')  p.set('status',    status);
      const res  = await fetch(`/api/admin/appointments?${p.toString()}`);
      const data = (await res.json()) as Appointment[];
      setAppointments(data);
    } finally {
      setLoading(false);
    }
  }, [masterId, serviceId, from, to, status]);

  useEffect(() => { void load(); }, [load]);

  // Master salary summary
  const summary: MasterSummary[] = Object.values(
    appointments.reduce<Record<string, MasterSummary>>((acc, a) => {
      const key  = a.master ?? 'Neznámy';
      const prev = acc[key] ?? { name: key, count: 0, revenue: 0 };
      acc[key] = {
        name:    key,
        count:   prev.count + 1,
        revenue: prev.revenue + (a.priceAtBooking ?? a.servicePrice ?? 0),
      };
      return acc;
    }, {})
  ).sort((a, b) => b.revenue - a.revenue);

  const totalRevenue = summary.reduce((s, m) => s + m.revenue, 0);

  const STATUS_OPTIONS = ['ALL', 'COMPLETED', 'CANCELLED', 'CONFIRMED', 'PENDING', 'NO_SHOW'];

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <h1 className={styles.title}>
          {t.nav.history}
        </h1>
        <span className={styles.count}>{appointments.length} záznamov</span>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <select
          value={masterId}
          onChange={(e) => setMasterId(e.target.value)}
          className={styles.select}
        >
          <option value="">Všetci majstri</option>
          {masters.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        <select
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          className={styles.select}
        >
          <option value="">Všetky služby</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>{s.nameKey}</option>
          ))}
        </select>

        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className={styles.dateInput}
          placeholder="Od"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className={styles.dateInput}
          placeholder="Do"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={styles.select}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s === 'ALL' ? 'Všetky statusy' : s}</option>
          ))}
        </select>

        <button onClick={() => void load()} className={styles.btnRefresh}>
          ↻
        </button>
      </div>

      {/* Salary summary */}
      {summary.length > 0 && (
        <div className={styles.summary}>
          <h2 className={styles.summaryTitle}>Prehľad podľa majstra</h2>
          <div className={styles.summaryGrid}>
            {summary.map((m) => (
              <div key={m.name} className={styles.summaryCard}>
                <p className={styles.summaryMaster}>{m.name}</p>
                <p className={styles.summaryCount}>{m.count} rezervácií</p>
                <p className={styles.summaryRevenue}>{fmtEur(m.revenue)}</p>
              </div>
            ))}
            <div className={`${styles.summaryCard} ${styles.summaryCardTotal}`}>
              <p className={styles.summaryMaster}>Celkom</p>
              <p className={styles.summaryCount}>{appointments.length} rezervácií</p>
              <p className={styles.summaryRevenue}>{fmtEur(totalRevenue)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p className={styles.loadingText}>Načítavam históriu...</p>
      ) : appointments.length === 0 ? (
        <p className={styles.emptyText}>Žiadne záznamy pre vybraté filtre.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Dátum</th>
                <th>Čas</th>
                <th>Klient</th>
                <th>Telefón</th>
                <th>Majster</th>
                <th>Služba</th>
                <th>Cena</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td>{fmtDate(a.date)}</td>
                  <td>{a.timeSlot}</td>
                  <td>{a.guestName ?? '—'}</td>
                  <td>{a.guestPhone ?? '—'}</td>
                  <td>{a.master ?? '—'}</td>
                  <td>{a.service ?? '—'}</td>
                  <td>{fmtEur(a.priceAtBooking ?? a.servicePrice)}</td>
                  <td>
                    <span className={`${styles.badge} ${styles[`badge_${a.status.toLowerCase()}`] ?? ''}`}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
