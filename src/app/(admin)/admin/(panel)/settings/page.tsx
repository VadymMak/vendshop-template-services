'use client';

import { useEffect, useRef, useState } from 'react';
import WorkingHours from '@/components/admin/WorkingHours';
import styles from './settings.module.css';

type Tab = 'store' | 'notifications' | 'security' | 'schedule';

const BASE_TABS: { key: Tab; label: string }[] = [
  { key: 'store',         label: 'Obchod' },
  { key: 'notifications', label: 'Notifikácie' },
  { key: 'security',      label: 'Bezpečnosť' },
];

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

function EyeIcon({ off }: { off?: boolean }) {
  return off ? (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} aria-hidden="true"><path d="M2 12s3.5-7 10-7c2 0 3.7.6 5.2 1.5M22 12s-3.5 7-10 7c-2 0-3.7-.6-5.2-1.5" /><path d="M3 3l18 18" /></svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
  );
}
function UploadIcon() {
  return <svg width="28" height="28" viewBox="0 0 24 24" {...stroke} aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 9l5-5 5 5M12 4v12" /></svg>;
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

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<Tab>('store');
  const [vertical, setVertical] = useState('');

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
            openingHours: (s.openingHours as string) ?? '',
            mapLat: s.mapLat != null ? String(s.mapLat) : '',
            mapLng: s.mapLng != null ? String(s.mapLng) : '',
          }));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const tabs = [
    ...BASE_TABS,
    ...(vertical === 'RESTAURANT' ? [{ key: 'schedule' as Tab, label: 'Rozvrh' }] : []),
  ];

  const [toast, setToast] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
          openingHours: store.openingHours || null,
          mapLat: store.mapLat ? parseFloat(store.mapLat) : null,
          mapLng: store.mapLng ? parseFloat(store.mapLng) : null,
        }),
      });
      if (res.ok) {
        setToast(true);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(false), 2000);
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const showToast = () => {
    setToast(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(false), 2000);
  };

  const [store, setStore] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    openingHours: '',
    mapLat: '',
    mapLng: '',
    facebook: '',
    instagram: '',
    whatsapp: '',
  });
  const [notif, setNotif] = useState({ emailOn: true, email: '', reviewsOn: true, telegramOn: false, botToken: '', chatId: '' });
  const [security, setSecurity] = useState({ currentPw: '', newPw: '', confirmPw: '', twoFactor: false });

  const sStore = <K extends keyof typeof store>(k: K, v: (typeof store)[K]) => setStore((p) => ({ ...p, [k]: v }));
  const sNotif = <K extends keyof typeof notif>(k: K, v: (typeof notif)[K]) => setNotif((p) => ({ ...p, [k]: v }));
  const sSec = <K extends keyof typeof security>(k: K, v: (typeof security)[K]) => setSecurity((p) => ({ ...p, [k]: v }));

  return (
    <div className={styles.page}>
      <h1 className={styles.h1}>Nastavenia</h1>

      <div className={styles.tabs}>
        {tabs.map((t) => (
          <button key={t.key} type="button" className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB — Obchod */}
      {tab === 'store' && (
        <div className={styles.card}>
          {loading ? (
            <p style={{ color: '#6b7280', fontSize: 14 }}>Načítavam...</p>
          ) : (
            <>
              <div className={styles.logoUpload} onClick={() => console.log('[admin logo upload]')}>
                <UploadIcon />
                <span>Nahrať logo</span>
              </div>

              <Field label="Názov salóna">
                <input className={styles.input} value={store.name} onChange={(e) => sStore('name', e.target.value)} />
              </Field>
              <Field label="Popis">
                <textarea className={styles.textarea} rows={3} value={store.description} onChange={(e) => sStore('description', e.target.value)} />
              </Field>
              <div className={styles.grid2}>
                <Field label="Telefón"><input className={styles.input} value={store.phone} onChange={(e) => sStore('phone', e.target.value)} /></Field>
                <Field label="Email"><input className={styles.input} type="email" value={store.email} onChange={(e) => sStore('email', e.target.value)} /></Field>
              </div>

              <Field label="Adresa salóna">
                <input className={styles.input} value={store.address} onChange={(e) => sStore('address', e.target.value)} placeholder="Hlavná ulica 15" />
              </Field>
              <div className={styles.grid2}>
                <Field label="Mesto">
                  <input className={styles.input} value={store.city} onChange={(e) => sStore('city', e.target.value)} placeholder="Trenčín" />
                </Field>
                <Field label="Pracovné hodiny">
                  <input className={styles.input} value={store.openingHours} onChange={(e) => sStore('openingHours', e.target.value)} placeholder="Po–Pia: 9:00–19:00" />
                </Field>
              </div>
              <div className={styles.grid2}>
                <Field label="Zemepisná šírka (lat)">
                  <input className={styles.input} type="number" step="any" value={store.mapLat} onChange={(e) => sStore('mapLat', e.target.value)} placeholder="48.8944" />
                </Field>
                <Field label="Zemepisná dĺžka (lng)">
                  <input className={styles.input} type="number" step="any" value={store.mapLng} onChange={(e) => sStore('mapLng', e.target.value)} placeholder="18.0440" />
                </Field>
              </div>

              <div className={styles.grid2}>
                <Field label="Facebook"><input className={styles.input} value={store.facebook} placeholder="https://facebook.com/..." onChange={(e) => sStore('facebook', e.target.value)} /></Field>
                <Field label="Instagram"><input className={styles.input} value={store.instagram} placeholder="https://instagram.com/..." onChange={(e) => sStore('instagram', e.target.value)} /></Field>
              </div>
              <Field label="WhatsApp">
                <input className={styles.input} value={store.whatsapp} placeholder="https://wa.me/421..." onChange={(e) => sStore('whatsapp', e.target.value)} />
              </Field>

              <button type="button" className={styles.saveBtn} onClick={saveStore} disabled={saving}>
                {saving ? 'Ukladám...' : 'Uložiť zmeny'}
              </button>
            </>
          )}
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
            <Field label="Email pre notifikácie"><input className={styles.input} type="email" value={notif.email} onChange={(e) => sNotif('email', e.target.value)} /></Field>
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
            <Field label="Bot Token"><MaskedInput value={notif.botToken} onChange={(v) => sNotif('botToken', v)} placeholder="••••••••••••" /></Field>
            <Field label="Chat ID"><input className={styles.input} value={notif.chatId} onChange={(e) => sNotif('chatId', e.target.value)} /></Field>
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
            <Field label="Aktuálne heslo"><MaskedInput value={security.currentPw} onChange={(v) => sSec('currentPw', v)} /></Field>
            <Field label="Nové heslo"><MaskedInput value={security.newPw} onChange={(v) => sSec('newPw', v)} /></Field>
            <Field label="Potvrďte heslo"><MaskedInput value={security.confirmPw} onChange={(v) => sSec('confirmPw', v)} /></Field>
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
