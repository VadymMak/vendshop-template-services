'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './settings.module.css';

type Tab = 'store' | 'delivery' | 'payment' | 'notifications' | 'security';
const TABS: { key: Tab; label: string }[] = [
  { key: 'store', label: 'Магазин' },
  { key: 'delivery', label: 'Доставка' },
  { key: 'payment', label: 'Оплата' },
  { key: 'notifications', label: 'Сповіщення' },
  { key: 'security', label: 'Безпека' },
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
      <button type="button" className={styles.eye} onClick={() => setShow((s) => !s)} aria-label="Показати або приховати">
        <EyeIcon off={show} />
      </button>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<Tab>('store');

  // Toast
  const [toast, setToast] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);
  const save = (section: string, data: unknown) => {
    console.log('[admin settings save]', section, data);
    setToast(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(false), 2000);
  };

  // Store
  const [store, setStore] = useState({ name: 'ЕлектроМаркет', description: 'Професійний електроінструмент від провідних брендів.', phone: '+38 (097) 123-45-67', email: 'info@electromarket.ua', address: 'м. Київ, вул. Хрещатик, 1', schedule: 'Пн-Нд: 9:00-20:00', facebook: '', instagram: '', youtube: '' });
  // Delivery
  const [delivery, setDelivery] = useState({ novaPoshtaOn: true, novaPoshtaKey: '', pickupOn: true, pickupAddress: 'м. Київ, вул. Хрещатик, 1', freeFrom: '2000' });
  // Payment
  const [payment, setPayment] = useState({ wayforpayOn: true, wfpMerchant: '', wfpSecret: '', wfpTest: false, liqpayOn: true, liqPublic: '', liqPrivate: '', codOn: true, codFee: '0' });
  // Notifications
  const [notif, setNotif] = useState({ emailOn: true, email: 'orders@electromarket.ua', reviewsOn: true, lowStockOn: true, telegramOn: false, botToken: '', chatId: '' });
  // Security
  const [security, setSecurity] = useState({ currentPw: '', newPw: '', confirmPw: '', twoFactor: false });

  const sStore = <K extends keyof typeof store>(k: K, v: (typeof store)[K]) => setStore((p) => ({ ...p, [k]: v }));
  const sDel = <K extends keyof typeof delivery>(k: K, v: (typeof delivery)[K]) => setDelivery((p) => ({ ...p, [k]: v }));
  const sPay = <K extends keyof typeof payment>(k: K, v: (typeof payment)[K]) => setPayment((p) => ({ ...p, [k]: v }));
  const sNotif = <K extends keyof typeof notif>(k: K, v: (typeof notif)[K]) => setNotif((p) => ({ ...p, [k]: v }));
  const sSec = <K extends keyof typeof security>(k: K, v: (typeof security)[K]) => setSecurity((p) => ({ ...p, [k]: v }));

  return (
    <div className={styles.page}>
      <h1 className={styles.h1}>Налаштування</h1>

      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button key={t.key} type="button" className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1 — Store */}
      {tab === 'store' && (
        <div className={styles.card}>
          <div className={styles.logoUpload} onClick={() => console.log('[admin logo upload]')}>
            <UploadIcon />
            <span>Завантажити логотип</span>
          </div>

          <Field label="Назва магазину">
            <input className={styles.input} value={store.name} onChange={(e) => sStore('name', e.target.value)} />
          </Field>
          <Field label="Опис">
            <textarea className={styles.textarea} rows={3} value={store.description} onChange={(e) => sStore('description', e.target.value)} />
          </Field>
          <div className={styles.grid2}>
            <Field label="Телефон"><input className={styles.input} value={store.phone} onChange={(e) => sStore('phone', e.target.value)} /></Field>
            <Field label="Email"><input className={styles.input} type="email" value={store.email} onChange={(e) => sStore('email', e.target.value)} /></Field>
          </div>
          <Field label="Адреса"><input className={styles.input} value={store.address} onChange={(e) => sStore('address', e.target.value)} /></Field>
          <Field label="Графік роботи"><input className={styles.input} value={store.schedule} onChange={(e) => sStore('schedule', e.target.value)} /></Field>
          <div className={styles.grid2}>
            <Field label="Facebook"><input className={styles.input} value={store.facebook} placeholder="https://facebook.com/..." onChange={(e) => sStore('facebook', e.target.value)} /></Field>
            <Field label="Instagram"><input className={styles.input} value={store.instagram} placeholder="https://instagram.com/..." onChange={(e) => sStore('instagram', e.target.value)} /></Field>
          </div>
          <Field label="YouTube"><input className={styles.input} value={store.youtube} placeholder="https://youtube.com/..." onChange={(e) => sStore('youtube', e.target.value)} /></Field>

          <button type="button" className={styles.saveBtn} onClick={() => save('store', store)}>Зберегти зміни</button>
        </div>
      )}

      {/* TAB 2 — Delivery */}
      {tab === 'delivery' && (
        <div className={styles.card}>
          <div className={styles.block}>
            <div className={styles.blockHead}>
              <span className={styles.blockTitle}>Нова Пошта</span>
              <Toggle checked={delivery.novaPoshtaOn} onChange={(v) => sDel('novaPoshtaOn', v)} />
            </div>
            <Field label="API ключ">
              <MaskedInput value={delivery.novaPoshtaKey} onChange={(v) => sDel('novaPoshtaKey', v)} placeholder="••••••••••••" />
            </Field>
            <button type="button" className={styles.testBtn} onClick={() => console.log('[test novaposhta]')}>Перевірити підключення</button>
          </div>

          <div className={styles.block}>
            <div className={styles.blockHead}>
              <span className={styles.blockTitle}>Самовивіз</span>
              <Toggle checked={delivery.pickupOn} onChange={(v) => sDel('pickupOn', v)} />
            </div>
            <Field label="Адреса магазину"><input className={styles.input} value={delivery.pickupAddress} onChange={(e) => sDel('pickupAddress', e.target.value)} /></Field>
          </div>

          <Field label="Безкоштовна доставка від, грн">
            <input className={styles.input} type="number" value={delivery.freeFrom} onChange={(e) => sDel('freeFrom', e.target.value)} />
          </Field>

          <button type="button" className={styles.saveBtn} onClick={() => save('delivery', delivery)}>Зберегти</button>
        </div>
      )}

      {/* TAB 3 — Payment */}
      {tab === 'payment' && (
        <div className={styles.card}>
          <div className={styles.block}>
            <div className={styles.blockHead}>
              <span className={styles.blockTitle}>WayForPay</span>
              <Toggle checked={payment.wayforpayOn} onChange={(v) => sPay('wayforpayOn', v)} />
            </div>
            <Field label="Merchant Account"><input className={styles.input} value={payment.wfpMerchant} onChange={(e) => sPay('wfpMerchant', e.target.value)} /></Field>
            <Field label="Secret Key"><MaskedInput value={payment.wfpSecret} onChange={(v) => sPay('wfpSecret', v)} placeholder="••••••••••••" /></Field>
            <div className={styles.settingRow}>
              <span>Тестовий режим</span>
              <Toggle checked={payment.wfpTest} onChange={(v) => sPay('wfpTest', v)} />
            </div>
            <button type="button" className={styles.testBtn} onClick={() => console.log('[test wayforpay]')}>Перевірити підключення</button>
          </div>

          <div className={styles.block}>
            <div className={styles.blockHead}>
              <span className={styles.blockTitle}>LiqPay</span>
              <Toggle checked={payment.liqpayOn} onChange={(v) => sPay('liqpayOn', v)} />
            </div>
            <Field label="Public Key"><input className={styles.input} value={payment.liqPublic} onChange={(e) => sPay('liqPublic', e.target.value)} /></Field>
            <Field label="Private Key"><MaskedInput value={payment.liqPrivate} onChange={(v) => sPay('liqPrivate', v)} placeholder="••••••••••••" /></Field>
          </div>

          <div className={styles.block}>
            <div className={styles.blockHead}>
              <span className={styles.blockTitle}>Наложений платіж</span>
              <Toggle checked={payment.codOn} onChange={(v) => sPay('codOn', v)} />
            </div>
            <Field label="Комісія, %"><input className={styles.input} type="number" value={payment.codFee} onChange={(e) => sPay('codFee', e.target.value)} /></Field>
          </div>

          <button type="button" className={styles.saveBtn} onClick={() => save('payment', payment)}>Зберегти</button>
        </div>
      )}

      {/* TAB 4 — Notifications */}
      {tab === 'notifications' && (
        <div className={styles.card}>
          <div className={styles.block}>
            <div className={styles.blockHead}>
              <span className={styles.blockTitle}>Email</span>
              <Toggle checked={notif.emailOn} onChange={(v) => sNotif('emailOn', v)} />
            </div>
            <Field label="Email для сповіщень"><input className={styles.input} type="email" value={notif.email} onChange={(e) => sNotif('email', e.target.value)} /></Field>
            <div className={styles.settingRow}>
              <span>Сповіщення про нові відгуки</span>
              <Toggle checked={notif.reviewsOn} onChange={(v) => sNotif('reviewsOn', v)} />
            </div>
            <div className={styles.settingRow}>
              <span>Сповіщення про низькі залишки</span>
              <Toggle checked={notif.lowStockOn} onChange={(v) => sNotif('lowStockOn', v)} />
            </div>
          </div>

          <div className={styles.block}>
            <div className={styles.blockHead}>
              <span className={styles.blockTitle}>Telegram</span>
              <Toggle checked={notif.telegramOn} onChange={(v) => sNotif('telegramOn', v)} />
            </div>
            <Field label="Bot Token"><MaskedInput value={notif.botToken} onChange={(v) => sNotif('botToken', v)} placeholder="••••••••••••" /></Field>
            <Field label="Chat ID"><input className={styles.input} value={notif.chatId} onChange={(e) => sNotif('chatId', e.target.value)} /></Field>
            <button type="button" className={styles.testBtn} onClick={() => console.log('[test telegram]')}>Тест</button>
          </div>

          <button type="button" className={styles.saveBtn} onClick={() => save('notifications', notif)}>Зберегти</button>
        </div>
      )}

      {/* TAB 5 — Security */}
      {tab === 'security' && (
        <div className={styles.card}>
          <div className={styles.block}>
            <span className={styles.blockTitle}>Зміна паролю</span>
            <Field label="Поточний пароль"><MaskedInput value={security.currentPw} onChange={(v) => sSec('currentPw', v)} /></Field>
            <Field label="Новий пароль"><MaskedInput value={security.newPw} onChange={(v) => sSec('newPw', v)} /></Field>
            <Field label="Підтвердіть пароль"><MaskedInput value={security.confirmPw} onChange={(v) => sSec('confirmPw', v)} /></Field>
            <button type="button" className={styles.saveBtn} onClick={() => save('security', { changed: true })}>Змінити пароль</button>
          </div>

          <div className={styles.block}>
            <div className={styles.settingRow}>
              <span>Активних сесій: <b>2</b></span>
              <button type="button" className={styles.dangerBtn} onClick={() => console.log('[terminate all sessions]')}>Завершити всі сесії</button>
            </div>
          </div>

          <div className={styles.block}>
            <div className={styles.settingRow}>
              <span className={styles.twoFa}>
                Двофакторна автентифікація
                <span className={styles.soon}>Незабаром</span>
              </span>
              <Toggle checked={security.twoFactor} onChange={(v) => sSec('twoFactor', v)} disabled />
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={styles.toast} role="status">
          <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
          Налаштування збережено
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
