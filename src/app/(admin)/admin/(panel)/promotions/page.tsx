'use client';

import { useState, useEffect, useCallback } from 'react';
import PromoModal from '@/components/admin/PromoModal/PromoModal';
import ConfirmDialog from '@/components/admin/ConfirmDialog/ConfirmDialog';
import { useAdminLocale } from '@/hooks/useAdminLocale';
import { getAdminT } from '@/lib/admin-i18n';
import {
  type DbPromoType,
  type PromoFormData,
  type PromoItem,
  PROMO_DB_TYPES,
} from '@/components/admin/promoTypes';
import styles from './promotions.module.css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _PROMO_DB_TYPES = PROMO_DB_TYPES;

type TypeI18nKey = 'typeDiscount' | 'typeServiceOfDay' | 'typeBanner' | 'typeFreeDelivery';

const TYPE_I18N: Record<DbPromoType, TypeI18nKey> = {
  DISCOUNT:       'typeDiscount',
  PRODUCT_OF_DAY: 'typeServiceOfDay',
  BANNER:         'typeBanner',
  FREE_DELIVERY:  'typeFreeDelivery',
};

function computeStatus(promo: {
  active: boolean;
  startsAt: string;
  endsAt: string | null;
}): 'active' | 'scheduled' | 'finished' {
  const now = Date.now();
  const start = new Date(promo.startsAt).getTime();
  const end = promo.endsAt ? new Date(promo.endsAt).getTime() : Infinity;
  if (!promo.active || now > end) return 'finished';
  if (now < start) return 'scheduled';
  return 'active';
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

const EMPTY_FORM: PromoFormData = {
  title: '',
  type: 'DISCOUNT',
  discountPct: '10',
  promoCode: '',
  description: '',
  startDate: '',
  endDate: '',
  showBanner: false,
};

type ModalState = { mode: 'add' } | { mode: 'edit'; id: string } | null;

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function PlusIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>;
}

export default function AdminPromotionsPage() {
  const { locale } = useAdminLocale();
  const t = getAdminT(locale);
  const pt = t.promotions;

  const [promos, setPromos] = useState<PromoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [bannerText, setBannerText] = useState('');
  const [showBanner, setShowBanner] = useState(false);

  const loadPromos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/promotions');
      if (res.ok) {
        const data = await res.json() as Array<{
          id: string;
          title: string;
          type: string;
          discountPercent: number | null;
          description: string | null;
          startsAt: string;
          endsAt: string | null;
          active: boolean;
        }>;
        setPromos(
          data.map((p) => ({
            id: p.id,
            title: p.title,
            type: p.type as DbPromoType,
            discountPercent: p.discountPercent,
            description: p.description,
            startsAt: p.startsAt,
            endsAt: p.endsAt,
            active: p.active,
            status: computeStatus({ active: p.active, startsAt: p.startsAt, endsAt: p.endsAt }),
          })),
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadPromos(); }, [loadPromos]);

  const handleSave = async (data: PromoFormData) => {
    const payload = {
      title: data.title,
      type: data.type,
      discountPercent: data.discountPct ? Number(data.discountPct) : null,
      description: data.description || null,
      startsAt: data.startDate || new Date().toISOString(),
      endsAt: data.endDate || null,
    };
    if (modal?.mode === 'edit') {
      await fetch(`/api/admin/promotions/${modal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch('/api/admin/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    setModal(null);
    void loadPromos();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await fetch(`/api/admin/promotions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !current }),
    });
    void loadPromos();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/promotions/${id}`, { method: 'DELETE' });
    setConfirmId(null);
    void loadPromos();
  };

  const getInitialForm = (id?: string): PromoFormData => {
    if (!id) return EMPTY_FORM;
    const p = promos.find((x) => x.id === id);
    if (!p) return EMPTY_FORM;
    return {
      title: p.title,
      type: p.type,
      discountPct: p.discountPercent?.toString() ?? '',
      promoCode: '',
      description: p.description ?? '',
      startDate: p.startsAt.split('T')[0] ?? '',
      endDate: p.endsAt ? (p.endsAt.split('T')[0] ?? '') : '',
      showBanner: false,
    };
  };

  const STATUS_LABEL: Record<'active' | 'scheduled' | 'finished', string> = {
    active:    pt.statusActive,
    scheduled: pt.statusScheduled,
    finished:  pt.statusFinished,
  };

  return (
    <div className={styles.page}>
      <div className={styles.top}>
        <h1 className={styles.h1}>{pt.title}</h1>
        <button type="button" className={styles.createBtn} onClick={() => setModal({ mode: 'add' })}>
          <PlusIcon />
          {pt.newPromo}
        </button>
      </div>

      {loading ? (
        <p className={styles.emptyState}>{t.common?.loading ?? '…'}</p>
      ) : promos.length === 0 ? (
        <p className={styles.emptyState}>{pt.noPromos}</p>
      ) : (
        <div className={styles.grid}>
          {promos.map((p) => (
            <article key={p.id} className={`${styles.card} ${styles[`card_${p.status}`]}`}>
              <div className={styles.cardTop}>
                <span className={`${styles.statusBadge} ${styles[`badge_${p.status}`]}`}>
                  {STATUS_LABEL[p.status]}
                </span>
                <span className={styles.cardType}>
                  {String(pt[TYPE_I18N[p.type]])}
                </span>
              </div>
              <h3 className={styles.cardTitle}>{p.title}</h3>
              <div className={styles.cardMeta}>
                {p.discountPercent != null && (
                  <span className={styles.discount}>{pt.discount}: <strong>−{p.discountPercent}%</strong></span>
                )}
                <span className={styles.period}>
                  {pt.period}: {fmtDate(p.startsAt)}{p.endsAt ? ` → ${fmtDate(p.endsAt)}` : ''}
                </span>
              </div>
              <div className={styles.footer}>
                <button
                  type="button"
                  className={styles.action}
                  onClick={() => setModal({ mode: 'edit', id: p.id })}
                >
                  {pt.editBtn}
                </button>
                <button
                  type="button"
                  className={styles.action}
                  onClick={() => void toggleActive(p.id, p.active)}
                >
                  {p.active ? pt.pause : pt.resume}
                </button>
                <button
                  type="button"
                  className={`${styles.action} ${styles.delete}`}
                  onClick={() => setConfirmId(p.id)}
                >
                  {pt.deleteBtn}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <h2 className={styles.sectionTitle}>{pt.announcementTitle}</h2>
      <div className={styles.announceCard}>
        <div className={styles.preview} data-hidden={!showBanner}>
          <span className={styles.previewLabel}>{pt.validFrom}:</span>
          <span className={styles.previewText}>{bannerText}</span>
        </div>
        <textarea
          className={styles.announceTextarea}
          rows={2}
          value={bannerText}
          onChange={(e) => setBannerText(e.target.value)}
          placeholder={pt.descriptionLabel}
        />
        <div className={styles.announceControls}>
          <label className={styles.toggleRow}>
            <span className={styles.toggle}>
              <input
                type="checkbox"
                checked={showBanner}
                onChange={(e) => setShowBanner(e.target.checked)}
              />
              <span className={styles.track} />
            </span>
            {showBanner ? pt.showOnSite : pt.hiddenLabel}
          </label>
        </div>
      </div>

      {modal && (
        <PromoModal
          mode={modal.mode}
          initial={getInitialForm(modal.mode === 'edit' ? modal.id : undefined)}
          onSave={(data) => void handleSave(data)}
          onClose={() => setModal(null)}
        />
      )}

      {confirmId && (
        <ConfirmDialog
          message={pt.deleteConfirm}
          onConfirm={() => void handleDelete(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
