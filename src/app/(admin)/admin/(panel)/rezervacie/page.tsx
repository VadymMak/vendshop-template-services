'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdminLocale } from '@/hooks/useAdminLocale';
import { getAdminT } from '@/lib/admin-i18n';
import styles from './rezervacie.module.css';
import AdminLoading from '@/components/admin/AdminLoading/AdminLoading';

type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

interface Appointment {
  id:        string;
  guestName:  string | null;
  guestPhone: string | null;
  date:       string;
  timeSlot:   string;
  status:     AppointmentStatus;
  service:    string | null;
  master:     string | null;
  note:       string | null;
  createdAt:  string;
}

interface Master  { id: string; name: string }
interface Service { id: string; nameKey: string }

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
  const [masters,      setMasters]      = useState<Master[]>([]);
  const [services,     setServices]     = useState<Service[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [busy,         setBusy]         = useState<Set<string>>(new Set());

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [masterId,     setMasterId]     = useState('');
  const [serviceId,    setServiceId]    = useState('');
  const [from,         setFrom]         = useState('');
  const [to,           setTo]           = useState('');

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
      const p = new URLSearchParams({ scope: 'active' });
      if (statusFilter !== 'ALL') p.set('status', statusFilter);
      if (masterId)               p.set('masterId',  masterId);
      if (serviceId)              p.set('serviceId', serviceId);
      if (from)                   p.set('from', from);
      if (to)                     p.set('to',   to);
      const res  = await fetch(`/api/admin/appointments?${p.toString()}`);
      const data = (await res.json()) as Appointment[];
      setAppointments(data);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, masterId, serviceId, from, to]);

  useEffect(() => { void load(); }, [load]);

  const clearFilters = () => {
    setMasterId('');
    setServiceId('');
    setFrom('');
    setTo('');
  };

  const hasExtraFilters = masterId || serviceId || from || to;

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
        <span className={styles.countBadge}>{appointments.length}</span>
      </div>

      {/* Filter panel */}
      <div className={styles.filterPanel}>
        <select
          value={masterId}
          onChange={(e) => setMasterId(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">{r.allMasters}</option>
          {masters.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        <select
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">{r.allServices}</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>{s.nameKey}</option>
          ))}
        </select>

        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className={styles.datePicker}
          title="Od"
        />

        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className={styles.datePicker}
          title="Do"
        />

        {hasExtraFilters && (
          <button type="button" className={styles.clearDateBtn} onClick={clearFilters}>
            {r.clearDate}
          </button>
        )}
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

      {/* Status filter tabs */}
      <div className={styles.filters}>
        {FILTER_KEYS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setStatusFilter(f.value)}
            className={`${styles.filterBtn} ${statusFilter === f.value ? styles.filterActive : ''}`}
          >
            {r[f.tKey] as string}
          </button>
        ))}
      </div>

      {/* Cards */}
      {loading ? (
        <AdminLoading rows={4} />
      ) : (
        <div className={styles.grid}>
          {appointments.length === 0 && (
            <div className={styles.empty}>{r.noReservations}</div>
          )}

          {appointments.map((a) => {
            const isBusy      = busy.has(a.id);
            const isCancelled = a.status === 'CANCELLED';
            const waLink      = a.guestPhone
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
                  {a.service && <span className={styles.chip}>✂️ {a.service}</span>}
                  {a.master  && <span className={styles.chip}>💈 {a.master}</span>}
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
