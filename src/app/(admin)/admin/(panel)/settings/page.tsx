'use client';

import { useEffect, useRef, useState } from 'react';
import WorkingHours from '@/components/admin/WorkingHours';
import AdminLoading from '@/components/admin/AdminLoading/AdminLoading';
import WorkingHoursEditor, { DEFAULT_HOURS, type HoursMap } from './WorkingHoursEditor';
import GalleryTab from './GalleryTab';
import MastersTab from './MastersTab';
import styles from './settings.module.css';
import { useAdminLocale } from '@/hooks/useAdminLocale';
import { getAdminT } from '@/lib/admin-i18n';

type Tab = 'store' | 'gallery' | 'masters' | 'notifications' | 'security' | 'schedule';

const BASE_TAB_KEYS: Tab[] = ['store', 'gallery', 'masters', 'notifications', 'security'];

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

function EyeIcon({ off }: { off?: boolean }) {
  return off ? (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} aria-hidden="true"><path d="M2 12s3.5-7 10-7c2 0 3.7.6 5.2 1.5M22 12s-3.5 7-10 7c-2 0-3.7-.6-5.2-1.5" /><path d="M3 3l18 18" /></svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
  );
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <span className={`${styles.toggle} ${disabled ? styles.toggleDisabled : ''}`}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span className={styles.track} />
    </span>
  );
}

function MaskedInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className={styles.masked}>
      <input className={styles.input} type={show ? 'text' : 'password'} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      <button type="button" className={styles.eye} onClick={() => setShow((s) => !s)} aria-label="Zobraziť alebo skryť">
        <EyeIcon off={show} />
      </button>
    </div>
  );
}

function parseHours(raw: unknown): HoursMap {
  if (!raw || typeof raw !== 'string') return DEFAULT_HOURS;
  try {
    const parsed = JSON.parse(raw) as HoursMap;
    // validate it has at least one expected key
    if ('mon' in parsed) return parsed;
  } catch {
    // plain text string — fall back to defaults
  }
  return DEFAULT_HOURS;
}

export default function AdminSettingsPage() {
  const { locale } = useAdminLocale();
  const tr = getAdminT(locale);

  const [tab, setTab] = useState<Tab>('store');
  const [vertical, setVertical] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [store, setStore] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    mapLat: '',
    mapLng: '',
    facebook: '',
    instagram: '',
    whatsapp: '',
  });

  // Working hours — parsed from openingHours JSON string
  const [hours, setHours] = useState<HoursMap>(DEFAULT_HOURS);

  // Logo
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/store-info')
      .then((r) => r.json() as Promise<{ store?: Record<string, unknown> }>)
      .then((data) => {
        if (data.store) {
          const s = data.store;
          if (s.vertical) setVertical(s.vertical as string);
          setStore((prev) => ({
            ...prev,
            name: (s.name as string) ?? '',
            description: (s.description as string) ?? '',
            phone: (s.phone as string) ?? '',
            email: (s.email as string) ?? '',
            address: (s.address as string) ?? '',
            city: (s.city as string) ?? '',
            mapLat: s.mapLat != null ? String(s.mapLat) : '',
            mapLng: s.mapLng != null ? String(s.mapLng) : '',
          }));
          setHours(parseHours(s.openingHours));
          setLogoUrl((s.logoUrl as string | null) ?? null);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const tabKeys: Tab[] = [
    ...BASE_TAB_KEYS,
    ...(vertical === 'RESTAURANT' ? ['schedule' as Tab] : []),
  ];

  const [toast, setToast] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const showToast = () => {
    setToast(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(false), 2000);
  };

  const saveStore = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/store-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: store.name,
          description: store.description,
          phone: store.phone || null,
          email: store.email || null,
          address: store.address || null,
          city: store.city || null,
          openingHours: JSON.stringify(hours),
          mapLat: store.mapLat ? parseFloat(store.mapLat) : null,
          mapLng: store.mapLng ? parseFloat(store.mapLng) : null,
        }),
      });
      if (res.ok) showToast();
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/admin/settings/logo', { method: 'POST', body: fd });
    const data = (await res.json()) as { url?: string; error?: string };
    if (data.url) setLogoUrl(data.url);
    setLogoUploading(false);
    e.target.value = '';
  };

  const handleLogoRemove = async () => {
    if (!window.confirm(tr.settings.removeLogoConfirm)) return;
    setLogoUploading(true);
    const res = await fetch('/api/admin/settings/logo', { method: 'DELETE' });
    if (res.ok) {
      setLogoUrl(null);
      showToast();
    }
    setLogoUploading(false);
  };

  const sStore = <K extends keyof typeof store>(k: K, v: (typeof store)[K]) =>
    setStore((p) => ({ ...p, [k]: v }));

  const [notif, setNotif]     = useState({ emailOn: true, email: '', reviewsOn: true, telegramOn: false, botToken: '', chatId: '' });
  const [security, setSecurity] = useState({ currentPw: '', newPw: '', confirmPw: '', twoFactor: false });
  const sNotif = <K extends keyof typeof notif>(k: K, v: (typeof notif)[K]) => setNotif((p) => ({ ...p, [k]: v }));
  const sSec   = <K extends keyof typeof security>(k: K, v: (typeof security)[K]) => setSecurity((p) => ({ ...p, [k]: v }));

  return (
    <div className={styles.page}>
      <h1 className={styles.h1}>{tr.settings.title}</h1>

      <div className={styles.tabs}>
        {tabKeys.map((key) => (
          <button
            key={key}
            type="button"
            className={`${styles.tab} ${tab === key ? styles.tabActive : ''}`}
            onClick={() => setTab(key)}
          >
            {tr.settings.tabs[key]}
          </button>
        ))}
      </div>

      {/* TAB — Obchod */}
      {tab === 'store' && (
        <div className={styles.card}>
          {loading ? (
            <AdminLoading rows={4} />
          ) : (
            <>
              {/* ── Logo upload ─────────────────────────────────────── */}
              <div style={{
                border: '1px solid var(--admin-border)',
                borderRadius: '12px',
                padding: '1.25rem 1.5rem',
                background: 'var(--admin-bg-card)',
                marginBottom: '1.5rem',
              }}>
                <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                  {tr.settings.logoLabel}
                </p>
                {logoUrl ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logoUrl}
                      alt="Logo"
                      style={{ height: '56px', objectFit: 'contain', background: 'var(--admin-bg-subtle)', borderRadius: '8px', padding: '0.5rem' }}
                    />
                    <label style={{ cursor: logoUploading ? 'wait' : 'pointer', color: 'var(--admin-kate-bronze)', fontSize: '0.875rem', textDecoration: 'underline' }}>
                      {logoUploading ? tr.settings.uploading : tr.settings.changeLogo}
                      <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} disabled={logoUploading} />
                    </label>
                    <button
                      type="button"
                      onClick={handleLogoRemove}
                      disabled={logoUploading}
                      style={{
                        background: 'none',
                        border: '1px solid rgba(239,68,68,0.4)',
                        borderRadius: '6px',
                        color: 'var(--admin-error-text)',
                        fontSize: '0.8rem',
                        padding: '0.25rem 0.625rem',
                        cursor: logoUploading ? 'wait' : 'pointer',
                        opacity: logoUploading ? 0.5 : 1,
                      }}
                    >
                      {tr.settings.removeLogo}
                    </button>
                  </div>
                ) : (
                  <label style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                    padding: '1.5rem', cursor: logoUploading ? 'wait' : 'pointer',
                    border: '1px dashed var(--admin-border-light)', borderRadius: '8px', color: 'var(--admin-text-muted)',
                  }}>
                    <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>↑</span>
                    <span>{logoUploading ? tr.settings.uploading : tr.settings.uploadLogo}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-faint)' }}>WebP / PNG / JPG · výstup 400×120 · max 5 MB</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} disabled={logoUploading} />
                  </label>
                )}
              </div>

              {/* ── Store fields ─────────────────────────────────────── */}
              <Field label="Názov salóna">
                <input className={styles.input} value={store.name} onChange={(e) => sStore('name', e.target.value)} />
              </Field>
              <Field label="Popis">
                <textarea className={styles.textarea} rows={3} value={store.description} onChange={(e) => sStore('description', e.target.value)} />
              </Field>
              <div className={styles.grid2}>
                <Field label="Telefón">
                  <input className={styles.input} value={store.phone} onChange={(e) => sStore('phone', e.target.value)} />
                </Field>
                <Field label="Email">
                  <input className={styles.input} type="email" value={store.email} onChange={(e) => sStore('email', e.target.value)} />
                </Field>
              </div>
              <Field label="Adresa salóna">
                <input className={styles.input} value={store.address} onChange={(e) => sStore('address', e.target.value)} placeholder="Hlavná ulica 15" />
              </Field>
              <Field label="Mesto">
                <input className={styles.input} value={store.city} onChange={(e) => sStore('city', e.target.value)} placeholder="..." />
              </Field>

              {/* ── Working hours editor ─────────────────────────────── */}
              <div style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  {tr.settings.workingHoursLabel}
                </p>
                <WorkingHoursEditor value={hours} onChange={setHours} />
              </div>

              <div className={styles.grid2} style={{ marginTop: '1rem' }}>
                <Field label="Zemepisná šírka (lat)">
                  <input className={styles.input} type="number" step="any" value={store.mapLat} onChange={(e) => sStore('mapLat', e.target.value)} placeholder="48.8944" />
                </Field>
                <Field label="Zemepisná dĺžka (lng)">
                  <input className={styles.input} type="number" step="any" value={store.mapLng} onChange={(e) => sStore('mapLng', e.target.value)} placeholder="18.0440" />
                </Field>
              </div>

              <div className={styles.grid2}>
                <Field label="Facebook">
                  <input className={styles.input} value={store.facebook} placeholder="https://facebook.com/..." onChange={(e) => sStore('facebook', e.target.value)} />
                </Field>
                <Field label="Instagram">
                  <input className={styles.input} value={store.instagram} placeholder="https://instagram.com/..." onChange={(e) => sStore('instagram', e.target.value)} />
                </Field>
              </div>
              <Field label="WhatsApp">
                <input className={styles.input} value={store.whatsapp} placeholder="https://wa.me/421..." onChange={(e) => sStore('whatsapp', e.target.value)} />
              </Field>

              <button type="button" className={styles.saveBtn} onClick={saveStore} disabled={saving}>
                {saving ? tr.settings.savingBtn : tr.settings.saveBtn}
              </button>
            </>
          )}
        </div>
      )}

      {/* TAB — Galéria */}
      {tab === 'gallery' && (
        <div className={styles.card}>
          <GalleryTab />
        </div>
      )}

      {/* TAB — Majstri */}
      {tab === 'masters' && (
        <div className={styles.card}>
          <MastersTab />
        </div>
      )}

      {/* TAB — Notifikácie */}
      {tab === 'notifications' && (
        <div className={styles.card}>
          <div className={styles.block}>
            <div className={styles.blockHead}>
              <span className={styles.blockTitle}>Email</span>
              <Toggle checked={notif.emailOn} onChange={(v) => sNotif('emailOn', v)} />
            </div>
            <Field label="Email pre notifikácie">
              <input className={styles.input} type="email" value={notif.email} onChange={(e) => sNotif('email', e.target.value)} />
            </Field>
            <div className={styles.settingRow}>
              <span>Notifikácie o nových recenziách</span>
              <Toggle checked={notif.reviewsOn} onChange={(v) => sNotif('reviewsOn', v)} />
            </div>
          </div>

          <div className={styles.block}>
            <div className={styles.blockHead}>
              <span className={styles.blockTitle}>Telegram</span>
              <Toggle checked={notif.telegramOn} onChange={(v) => sNotif('telegramOn', v)} />
            </div>
            <Field label="Bot Token">
              <MaskedInput value={notif.botToken} onChange={(v) => sNotif('botToken', v)} placeholder="••••••••••••" />
            </Field>
            <Field label="Chat ID">
              <input className={styles.input} value={notif.chatId} onChange={(e) => sNotif('chatId', e.target.value)} />
            </Field>
            <button type="button" className={styles.testBtn} onClick={() => console.log('[test telegram]')}>Test</button>
          </div>

          <button type="button" className={styles.saveBtn} onClick={showToast}>Uložiť</button>
        </div>
      )}

      {/* TAB — Bezpečnosť */}
      {tab === 'security' && (
        <div className={styles.card}>
          <div className={styles.block}>
            <span className={styles.blockTitle}>Zmena hesla</span>
            <Field label="Aktuálne heslo">
              <MaskedInput value={security.currentPw} onChange={(v) => sSec('currentPw', v)} />
            </Field>
            <Field label="Nové heslo">
              <MaskedInput value={security.newPw} onChange={(v) => sSec('newPw', v)} />
            </Field>
            <Field label="Potvrďte heslo">
              <MaskedInput value={security.confirmPw} onChange={(v) => sSec('confirmPw', v)} />
            </Field>
            <button type="button" className={styles.saveBtn} onClick={showToast}>Zmeniť heslo</button>
          </div>

          <div className={styles.block}>
            <div className={styles.settingRow}>
              <span>Aktívnych relácií: <b>2</b></span>
              <button type="button" className={styles.dangerBtn} onClick={() => console.log('[terminate all sessions]')}>Ukončiť všetky relácie</button>
            </div>
          </div>

          <div className={styles.block}>
            <div className={styles.settingRow}>
              <span className={styles.twoFa}>
                Dvojfaktorová autentifikácia
                <span className={styles.soon}>Čoskoro</span>
              </span>
              <Toggle checked={security.twoFactor} onChange={(v) => sSec('twoFactor', v)} disabled />
            </div>
          </div>
        </div>
      )}

      {/* TAB — Rozvrh (restaurant only) */}
      {tab === 'schedule' && (
        <div className={styles.card}>
          <WorkingHours />
        </div>
      )}

      {toast && (
        <div className={styles.toast} role="status">
          <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
          Nastavenia uložené
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      {children}
    </label>
  );
}
