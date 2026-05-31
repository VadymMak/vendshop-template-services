'use client';

import { useState } from 'react';
import PromoModal from '@/components/admin/PromoModal/PromoModal';
import ConfirmDialog from '@/components/admin/ConfirmDialog/ConfirmDialog';
import {
  type PromoFormData,
  type PromoType,
  type PromoStatus,
  PROMO_TYPE_LABEL,
  PROMO_STATUS_LABEL,
} from '@/components/admin/promoTypes';
import styles from './promotions.module.css';

interface Promo {
  id: string;
  title: string;
  type: PromoType;
  discount: string; // percentage value, '' for free delivery
  target: string;
  startDate: string; // ISO yyyy-mm-dd
  endDate: string;
  applied: number;
  status: PromoStatus;
  announcement: string;
}

const BRANDS = ['MAKITA', 'BOSCH', 'DEWALT', 'MILWAUKEE', 'METABO'];
const CATEGORIES = [
  { slug: 'drills', label: 'Дрелі' },
  { slug: 'grinders', label: 'Болгарки' },
  { slug: 'perforators', label: 'Перфоратори' },
  { slug: 'jigsaws', label: 'Лобзики' },
  { slug: 'sanders', label: 'Шліфмашини' },
];

const INITIAL_PROMOS: Promo[] = [
  { id: 'p1', title: 'Літній розпродаж Makita', type: 'brand', discount: '15', target: 'MAKITA', startDate: '2026-06-01', endDate: '2026-06-30', applied: 234, status: 'active', announcement: 'Знижка -15% на весь асортимент Makita до кінця червня!' },
  { id: 'p2', title: 'Знижки на болгарки', type: 'category', discount: '20', target: 'Болгарки', startDate: '2026-06-15', endDate: '2026-07-15', applied: 0, status: 'scheduled', announcement: '' },
  { id: 'p3', title: 'Промокод SUMMER10', type: 'promocode', discount: '10', target: 'SUMMER10', startDate: '2026-05-01', endDate: '2026-05-31', applied: 512, status: 'finished', announcement: '' },
  { id: 'p4', title: 'Безкоштовна доставка', type: 'freeDelivery', discount: '', target: '', startDate: '2026-06-01', endDate: '2026-08-31', applied: 1203, status: 'active', announcement: 'Безкоштовна доставка від 2000 грн!' },
];

const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return y && m && d ? `${d}.${m}.${y}` : iso;
};

const pluralRaz = (n: number) => {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return 'раз';
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'рази';
  return 'разів';
};

const discountLabel = (p: Promo) => (p.type === 'freeDelivery' ? 'Безкоштовно' : `-${p.discount}%`);

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

function PlusIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>;
}
function EditIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" {...stroke} aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" /></svg>;
}
function PauseIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" {...stroke} aria-hidden="true"><path d="M9 5v14M15 5v14" /></svg>;
}
function PlayIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5l12 7-12 7V5Z" /></svg>;
}
function TrashIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" {...stroke} aria-hidden="true"><path d="M3 6h18M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6m2.5 0-.7 13a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9L5.5 6" /><path d="M10 11v5M14 11v5" /></svg>;
}

type ModalState = { mode: 'add' } | { mode: 'edit'; id: string } | null;

export default function AdminPromotionsPage() {
  const [promos, setPromos] = useState<Promo[]>(INITIAL_PROMOS);
  const [modal, setModal] = useState<ModalState>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [announcement, setAnnouncement] = useState('Безкоштовна доставка від 1000 грн');
  const [announcementDraft, setAnnouncementDraft] = useState(announcement);
  const [announcementVisible, setAnnouncementVisible] = useState(true);

  const togglePause = (id: string) =>
    setPromos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: p.status === 'active' ? 'finished' : 'active' } : p)),
    );

  const doDelete = () => {
    if (!deletingId) return;
    const id = deletingId;
    setPromos((prev) => prev.filter((p) => p.id !== id));
    setDeletingId(null);
  };

  const handleSave = (data: PromoFormData) => {
    console.log('[admin promo save]', data);
    if (modal?.mode === 'edit') {
      const id = modal.id;
      setPromos((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, title: data.title, type: data.type, discount: data.discount, target: data.target, startDate: data.startDate, endDate: data.endDate, announcement: data.announcement }
            : p,
        ),
      );
    } else {
      setPromos((prev) => [
        {
          id: `new-${Date.now()}`,
          title: data.title,
          type: data.type,
          discount: data.discount,
          target: data.target,
          startDate: data.startDate,
          endDate: data.endDate,
          applied: 0,
          status: 'scheduled',
          announcement: data.announcement,
        },
        ...prev,
      ]);
    }
    setModal(null);
  };

  const saveAnnouncement = () => {
    console.log('[admin announcement save]', { text: announcementDraft, visible: announcementVisible });
    setAnnouncement(announcementDraft);
  };

  const editing = modal?.mode === 'edit' ? promos.find((p) => p.id === modal.id) : undefined;
  const modalInitial: PromoFormData = editing
    ? { title: editing.title, type: editing.type, discount: editing.discount, target: editing.target, startDate: editing.startDate, endDate: editing.endDate, announcement: editing.announcement }
    : { title: '', type: 'brand', discount: '', target: '', startDate: '', endDate: '', announcement: '' };

  return (
    <div className={styles.page}>
      <div className={styles.top}>
        <h1 className={styles.h1}>Акції та оголошення</h1>
        <button type="button" className={styles.createBtn} onClick={() => setModal({ mode: 'add' })}>
          <PlusIcon />
          Створити акцію
        </button>
      </div>

      {/* Section 1 — active promos */}
      <h2 className={styles.sectionTitle}>Активні акції</h2>
      <div className={styles.grid}>
        {promos.map((p) => (
          <article key={p.id} className={styles.card}>
            <div className={styles.banner}>
              <span className={styles.bannerTitle}>{p.title}</span>
              <span className={`${styles.status} ${styles[p.status]}`}>{PROMO_STATUS_LABEL[p.status]}</span>
            </div>
            <div className={styles.body}>
              <div className={styles.row}>
                <span className={styles.rowLabel}>Тип</span>
                <span className={styles.rowValue}>{PROMO_TYPE_LABEL[p.type]}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.rowLabel}>Знижка</span>
                <span className={styles.discount}>{discountLabel(p)}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.rowLabel}>Період</span>
                <span className={styles.rowValue}>{fmtDate(p.startDate)} — {fmtDate(p.endDate)}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.rowLabel}>Застосовано</span>
                <span className={styles.rowValue}>{p.applied} {pluralRaz(p.applied)}</span>
              </div>
            </div>
            <div className={styles.footer}>
              <button type="button" className={styles.action} onClick={() => setModal({ mode: 'edit', id: p.id })}>
                <EditIcon />
                Редагувати
              </button>
              <button type="button" className={styles.action} onClick={() => togglePause(p.id)}>
                {p.status === 'active' ? <PauseIcon /> : <PlayIcon />}
                {p.status === 'active' ? 'Призупинити' : 'Відновити'}
              </button>
              <button type="button" className={`${styles.action} ${styles.delete}`} onClick={() => setDeletingId(p.id)}>
                <TrashIcon />
                Видалити
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Section 2 — announcement strip */}
      <h2 className={styles.sectionTitle}>Рядок оголошень</h2>
      <div className={styles.announceCard}>
        <div className={styles.preview} data-hidden={!announcementVisible}>
          <span className={styles.previewLabel}>Прев&apos;ю:</span>
          <span className={styles.previewText}>{announcement}</span>
        </div>

        <textarea
          className={styles.announceTextarea}
          rows={2}
          value={announcementDraft}
          onChange={(e) => setAnnouncementDraft(e.target.value)}
          placeholder="Текст для announcement strip"
        />

        <div className={styles.announceControls}>
          <label className={styles.toggleRow}>
            <span className={styles.toggle}>
              <input type="checkbox" checked={announcementVisible} onChange={(e) => setAnnouncementVisible(e.target.checked)} />
              <span className={styles.track} />
            </span>
            {announcementVisible ? 'Показувати на сайті' : 'Приховано'}
          </label>
          <button type="button" className={styles.announceSave} onClick={saveAnnouncement}>
            Зберегти
          </button>
        </div>
      </div>

      {modal && (
        <PromoModal
          mode={modal.mode}
          initial={modalInitial}
          brands={BRANDS}
          categories={CATEGORIES}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {deletingId && (
        <ConfirmDialog message="Видалити цю акцію?" onConfirm={doDelete} onCancel={() => setDeletingId(null)} />
      )}
    </div>
  );
}
