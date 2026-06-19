'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdminLocale } from '@/hooks/useAdminLocale';
import { getAdminT } from '@/lib/admin-i18n';
import styles from './rezervacie.module.css';

type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

interface Appointment {
  id: string;
  guestName: string | null;
  guestPhone: string | null;
  date: string;
  timeSlot: string;
  status: AppointmentStatus;
  service: string | null;
  master: string | null;
  note: string | null;
  createdAt: string;
}

const FILTER_KEYS: { value: string; tKey: keyof ReturnType<typeof getAdminT>['reservations'] }[] = [
  { value: 'ALL',       tKey: 'all' },
  { value: 'PENDING',   tKey: 'pending' },
  { value: 'CONFIRMED', tKey: 'confirmed' },
  { value: 'COMPLETED', tKey: 'completed' },
  { value: 'CANCELLED', tKey: 'cancelled' },
];

const STATUS_T_MAP: Record<AppointmentStatus, keyof ReturnType<typeof getAdminT>['reservations']> = {
  PENDING:   'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  NO_SHOW:   'noShow',
};

function avatarLetter(name: string | null) {
  return name ? name.trim()[0]?.toUpperCase() ?? '?' : '?';
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('sk-SK', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function RezervaciaPage() {
  const { locale } = useAdminLocale();
  const t = getAdminT(locale);
  const r = t.reservations;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading]           = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [dateFilter, setDateFilter]     = useState('');
  const [busy, setBusy]                 = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeFilter !== 'ALL') params.set('status', activeFilter);
      if (dateFilter)             params.set('date', dateFilter);
      const res = await fetch(`/api/admin/appointments?${params.toString()}`);
      const data = (await res.json()) as Appointment[];
      setAppointments(data);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, dateFilter]);

  useEffect(() => { void load(); }, [load]);

  const updateStatus = async (id: string, status: AppointmentStatus) => {
    setBusy((prev) => new Set(prev).add(id));
    try {
      await fetch(`/api/admin/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
    } finally {
      setBusy((prev) => { const s = new Set(prev); s.delete(id); return s; });
    }
  };

  const cancelAppointment = async (id: string) => {
    setBusy((prev) => new Set(prev).add(id));
    try {
      await fetch(`/api/admin/appointments/${id}`, { method: 'DELETE' });
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'CANCELLED' } : a))
      );
    } finally {
      setBusy((prev) => { const s = new Set(prev); s.delete(id); return s; });
    }
  };

  const stats = {
    pending:   appointments.filter((a) => a.status === 'PENDING').length,
    confirmed: appointments.filter((a) => a.status === 'CONFIRMED').length,
    completed: appointments.filter((a) => a.status === 'COMPLETED').length,
    cancelled: appointments.filter((a) => a.status === 'CANCELLED').length,
  };

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <h1 className={styles.title}>{r.title}</h1>
        <div className={styles.topRight}>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className={styles.datePicker}
            aria-label={r.title}
          />
          {dateFilter && (
            <button
              type="button"
              className={styles.clearDateBtn}
              onClick={() => setDateFilter('')}
            >
              {r.clearDate}
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={`${styles.statCard} ${styles.statPending}`}>
          <div className={styles.statValue}>{stats.pending}</div>
          <div className={styles.statLabel}>{r.statPending}</div>
        </div>
        <div className={`${styles.statCard} ${styles.statConfirmed}`}>
          <div className={styles.statValue}>{stats.confirmed}</div>
          <div className={styles.statLabel}>{r.statConfirmed}</div>
        </div>
        <div className={`${styles.statCard} ${styles.statCompleted}`}>
          <div className={styles.statValue}>{stats.completed}</div>
          <div className={styles.statLabel}>{r.statCompleted}</div>
        </div>
        <div className={`${styles.statCard} ${styles.statCancelled}`}>
          <div className={styles.statValue}>{stats.cancelled}</div>
          <div className={styles.statLabel}>{r.statCancelled}</div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className={styles.filters}>
        {FILTER_KEYS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setActiveFilter(f.value)}
            className={`${styles.filterBtn} ${activeFilter === f.value ? styles.filterActive : ''}`}
          >
            {r[f.tKey] as string}
          </button>
        ))}
      </div>

      {/* Cards */}
      {loading ? (
        <div className={styles.loading}>{r.loading}</div>
      ) : (
        <div className={styles.grid}>
          {appointments.length === 0 && (
            <div className={styles.empty}>{r.noReservations}</div>
          )}

          {appointments.map((a) => {
            const isBusy = busy.has(a.id);
            const isCancelled = a.status === 'CANCELLED';
            const waLink = a.guestPhone
              ? `https://wa.me/${a.guestPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Dobrý deň, ${a.guestName ?? ''} — ohľadom Vašej rezervácie ${a.timeSlot} dňa ${fmtDate(a.date)}.`
                )}`
              : null;

            const statusLabel = r[STATUS_T_MAP[a.status]] as string;

            return (
              <div
                key={a.id}
                className={`${styles.card} ${isCancelled ? styles.cardCancelled : ''}`}
              >
                {/* Header */}
                <div className={styles.cardHead}>
                  <div className={styles.avatar}>{avatarLetter(a.guestName)}</div>
                  <div className={styles.clientInfo}>
                    <div className={styles.clientName}>{a.guestName ?? '—'}</div>
                    {a.guestPhone ? (
                      <a href={`tel:${a.guestPhone}`} className={styles.clientPhone}>
                        {a.guestPhone}
                      </a>
                    ) : (
                      <span className={styles.clientPhone}>—</span>
                    )}
                  </div>
                  <span className={`${styles.badge} ${styles[`badge${a.status}`]}`}>
                    {statusLabel}
                  </span>
                </div>

                {/* Chips */}
                <div className={styles.chips}>
                  <span className={`${styles.chip} ${styles.chipDate}`}>
                    📆 {fmtDate(a.date)} · {a.timeSlot}
                  </span>
                  {a.service && (
                    <span className={styles.chip}>✂️ {a.service}</span>
                  )}
                  {a.master && (
                    <span className={styles.chip}>💈 {a.master}</span>
                  )}
                </div>

                {/* Note */}
                {a.note && <div className={styles.note}>{a.note}</div>}

                {/* Actions */}
                <div className={styles.cardActions}>
                  {a.status === 'PENDING' && (
                    <button
                      type="button"
                      disabled={isBusy}
                      className={`${styles.btn} ${styles.btnConfirm}`}
                      onClick={() => void updateStatus(a.id, 'CONFIRMED')}
                    >
                      {r.confirm}
                    </button>
                  )}
                  {(a.status === 'PENDING' || a.status === 'CONFIRMED') && (
                    <button
                      type="button"
                      disabled={isBusy}
                      className={`${styles.btn} ${styles.btnComplete}`}
                      onClick={() => void updateStatus(a.id, 'COMPLETED')}
                    >
                      {r.complete}
                    </button>
                  )}
                  {a.status !== 'CANCELLED' && a.status !== 'COMPLETED' && (
                    <button
                      type="button"
                      disabled={isBusy}
                      className={`${styles.btn} ${styles.btnCancel}`}
                      onClick={() => void cancelAppointment(a.id)}
                    >
                      {r.cancel}
                    </button>
                  )}
                  {waLink && (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.btn} ${styles.btnWa}`}
                    >
                      {r.whatsapp}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
