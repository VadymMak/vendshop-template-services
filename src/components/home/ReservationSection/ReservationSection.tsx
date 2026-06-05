'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import styles from './ReservationSection.module.css';

interface ReservationForm {
  date: string;
  time: string;
  guests: number;
  name: string;
  phone: string;
  email: string;
  specialRequests: string;
  selectedTable: string | null;
}

interface TableDef {
  id: string;      // cuid from DB
  number: string;  // "T1", "T2" display label
  x: number;
  y: number;
  type: string;
  seats: number;
  zone: string;
  status: string;  // "available" | "occupied"
}

const TIME_SLOTS = ['12:00', '13:00', '14:00', '18:00', '19:00', '20:00', '21:00'];

const IS_LOGGED_IN = false;

export default function ReservationSection() {
  const t = useTranslations('reservation');

  const [form, setForm] = useState<ReservationForm>({
    date: '',
    time: '',
    guests: 2,
    name: '',
    phone: '',
    email: '',
    specialRequests: '',
    selectedTable: null,
  });
  const [tables, setTables] = useState<TableDef[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof ReservationForm, value: string | number | null) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const fetchTables = useCallback(async (date?: string, time?: string) => {
    try {
      const params = new URLSearchParams();
      if (date) params.set('date', date);
      if (time) params.set('time', time);
      const res = await fetch(`/api/tables?${params}`);
      const data = await res.json() as { tables?: TableDef[] };
      if (data.tables) setTables(data.tables);
    } catch {
      // silently keep existing table state
    }
  }, []);

  // Load table layout on mount
  useEffect(() => { fetchTables(); }, [fetchTables]);

  // Refresh availability when date+time changes
  useEffect(() => {
    if (form.date && form.time) {
      fetchTables(form.date, form.time);
      setForm((prev) => ({ ...prev, selectedTable: null }));
    }
  }, [form.date, form.time, fetchTables]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: form.date,
          time: form.time,
          guests: form.guests,
          name: form.name,
          phone: form.phone,
          email: form.email,
          specialRequests: form.specialRequests || undefined,
          tableId: form.selectedTable || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? 'Failed to create reservation');
      }

      setSubmitted(true);
      setForm({ date: '', time: '', guests: 2, name: '', phone: '', email: '', specialRequests: '', selectedTable: null });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTableClick = (table: TableDef) => {
    if (table.status === 'occupied') return;
    set('selectedTable', form.selectedTable === table.id ? null : table.id);
  };

  const tableStyle = (table: TableDef) => {
    if (table.status === 'occupied') return { stroke: '#991b1b', fill: 'rgba(153,27,27,0.2)' };
    if (form.selectedTable === table.id) return { stroke: '#d4a853', fill: 'rgba(212,168,83,0.15)' };
    return { stroke: '#444', fill: 'transparent' };
  };

  return (
    <section className={styles.section}>
      {/* Header */}
      <div className={styles.header}>
        <p className={styles.tagline}>{t('tagline')}</p>
        <h2 className={styles.title}>{t('title')}</h2>
        <p className={styles.subtitle}>{t('subtitle')}</p>
      </div>

      <div className={`${styles.container} ${!IS_LOGGED_IN ? styles.containerSingle : ''}`}>
        {/* ── Left: Form ── */}
        <div className={styles.formCard}>
          {submitted && (
            <div className={styles.successToast}>
              ✓ {t('confirm')} — we&apos;ll contact you shortly!
            </div>
          )}
          {error && (
            <div className={styles.errorToast}>{error}</div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.formGrid}>
              {/* Date */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="res-date">{t('date')}</label>
                <input
                  id="res-date"
                  className={styles.input}
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => set('date', e.target.value)}
                />
              </div>

              {/* Time */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="res-time">{t('time')}</label>
                <select
                  id="res-time"
                  className={styles.select}
                  required
                  value={form.time}
                  onChange={(e) => set('time', e.target.value)}
                >
                  <option value="">—</option>
                  {TIME_SLOTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Guests */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="res-guests">{t('guests')}</label>
                <input
                  id="res-guests"
                  className={styles.input}
                  type="number"
                  min={1}
                  max={12}
                  required
                  value={form.guests}
                  onChange={(e) => set('guests', parseInt(e.target.value, 10))}
                />
              </div>

              {/* Name */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="res-name">{t('yourName')}</label>
                <input
                  id="res-name"
                  className={styles.input}
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                />
              </div>

              {/* Phone */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="res-phone">{t('phone')}</label>
                <input
                  id="res-phone"
                  className={styles.input}
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                />
              </div>

              {/* Email */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="res-email">{t('email')}</label>
                <input
                  id="res-email"
                  className={styles.input}
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                />
              </div>

              {/* Special requests */}
              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label className={styles.label} htmlFor="res-requests">
                  {t('specialRequests')} <span className={styles.optional}>({t('optional')})</span>
                </label>
                <textarea
                  id="res-requests"
                  className={styles.textarea}
                  rows={3}
                  placeholder={t('specialRequestsPlaceholder')}
                  value={form.specialRequests}
                  onChange={(e) => set('specialRequests', e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? '...' : t('confirm')}
            </button>
          </form>

          <p className={styles.formNote}>{t('formNote')}</p>
        </div>

        {/* ── Right: Table map (only when logged in) ── */}
        {IS_LOGGED_IN && <div className={styles.mapCard}>
          <p className={styles.mapTitle}>{t('selectTable')}</p>
          <p className={styles.mapSubtitle}>{t('tapToSelect')}</p>

          <div className={styles.mapContainer}>
            <svg
              viewBox="0 0 640 320"
              className={styles.mapSvg}
              style={IS_LOGGED_IN ? {} : { filter: 'blur(6px)' }}
              aria-hidden={!IS_LOGGED_IN}
            >
              {/* Zone dividers */}
              <line x1="230" y1="20" x2="230" y2="300" stroke="#2a2a2a" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="490" y1="20" x2="490" y2="300" stroke="#2a2a2a" strokeWidth="1" strokeDasharray="4 4" />

              {/* Zone labels */}
              <text x="115" y="18" textAnchor="middle" fill="#555" fontSize="11" fontFamily="inherit">{t('terrace')}</text>
              <text x="360" y="18" textAnchor="middle" fill="#555" fontSize="11" fontFamily="inherit">{t('mainHall')}</text>
              <text x="565" y="18" textAnchor="middle" fill="#555" fontSize="11" fontFamily="inherit">{t('privateRoom')}</text>

              {/* Tables from DB */}
              {tables.map((table) => {
                const { stroke, fill } = tableStyle(table);
                const isOccupied = table.status === 'occupied';
                const r = table.type === 'round' ? (table.seats <= 2 ? 22 : 28) : 0;

                return (
                  <g
                    key={table.id}
                    onClick={() => IS_LOGGED_IN && handleTableClick(table)}
                    style={{ cursor: IS_LOGGED_IN && !isOccupied ? 'pointer' : 'default' }}
                  >
                    {table.type === 'round' ? (
                      <circle cx={table.x} cy={table.y} r={r} stroke={stroke} strokeWidth="2" fill={fill} />
                    ) : (
                      <rect x={table.x - 36} y={table.y - 20} width="72" height="40" rx="6" stroke={stroke} strokeWidth="2" fill={fill} />
                    )}
                    <text x={table.x} y={table.y + 1} textAnchor="middle" dominantBaseline="middle" fill="#aaa" fontSize="10" fontFamily="inherit">
                      {table.number}
                    </text>
                    <text x={table.x} y={table.y + 13} textAnchor="middle" dominantBaseline="middle" fill="#666" fontSize="9" fontFamily="inherit">
                      {table.seats}p
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Locked overlay */}
            {!IS_LOGGED_IN && (
              <div className={styles.mapOverlay}>
                <svg className={styles.lockIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <p className={styles.lockText}>{t('signInToChoose')}</p>
                <button type="button" className={styles.createAccountBtn}>
                  {t('createAccount')}
                </button>
                <p className={styles.signInLink}>
                  {t('alreadyHaveAccount')}{' '}
                  <a href="/login">{t('signIn')}</a>
                </p>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className={styles.legend}>
            <span><span className={`${styles.legendDot} ${styles.dotAvailable}`} />{t('available')}</span>
            <span><span className={`${styles.legendDot} ${styles.dotSelected}`} />{t('selected')}</span>
            <span><span className={`${styles.legendDot} ${styles.dotReserved}`} />{t('reserved')}</span>
          </div>

          <p className={styles.mapNote}>{t('mapNote')}</p>
        </div>}
      </div>
    </section>
  );
}
