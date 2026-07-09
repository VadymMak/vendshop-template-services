'use client';

import { useState } from 'react';
import { useAdminLocale } from '@/hooks/useAdminLocale';
import { getAdminT } from '@/lib/admin-i18n';
import { type DbPromoType, type PromoFormData, PROMO_DB_TYPES } from '@/components/admin/promoTypes';
import styles from './PromoModal.module.css';

type TypeI18nKey = 'typeDiscount' | 'typeServiceOfDay' | 'typeBanner' | 'typeFreeDelivery';

const TYPE_I18N_KEY: Record<DbPromoType, TypeI18nKey> = {
  DISCOUNT:       'typeDiscount',
  PRODUCT_OF_DAY: 'typeServiceOfDay',
  BANNER:         'typeBanner',
  FREE_DELIVERY:  'typeFreeDelivery',
};

export interface PromoModalProps {
  mode: 'add' | 'edit';
  initial: PromoFormData;
  onSave: (data: PromoFormData) => void;
  onClose: () => void;
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export default function PromoModal({ mode, initial, onSave, onClose }: PromoModalProps) {
  const { locale } = useAdminLocale();
  const t = getAdminT(locale);
  const pt = t.promotions;
  const [data, setData] = useState<PromoFormData>(initial);

  const set = <K extends keyof PromoFormData>(key: K, val: PromoFormData[K]) =>
    setData((d) => ({ ...d, [key]: val }));

  const showDiscount = data.type === 'DISCOUNT' || data.type === 'PRODUCT_OF_DAY';
  const showBannerText = data.type === 'BANNER';

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className={styles.head}>
          <h2 className={styles.title}>{mode === 'add' ? pt.createTitle : pt.editTitle}</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label={pt.cancelBtn}>
            <CloseIcon />
          </button>
        </div>

        <form className={styles.form} onSubmit={(e) => { e.preventDefault(); onSave(data); }}>
          <label className={styles.field}>
            <span className={styles.label}>{pt.nameLabel}</span>
            <input
              className={styles.input}
              type="text"
              value={data.title}
              onChange={(e) => set('title', e.target.value)}
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>{pt.type}</span>
            <select
              className={styles.input}
              value={data.type}
              onChange={(e) => set('type', e.target.value as DbPromoType)}
            >
              {PROMO_DB_TYPES.map((tp) => (
                <option key={tp} value={tp}>
                  {String(pt[TYPE_I18N_KEY[tp]])}
                </option>
              ))}
            </select>
          </label>

          {showDiscount && (
            <label className={styles.field}>
              <span className={styles.label}>{pt.discountPctLabel}</span>
              <input
                className={styles.input}
                type="number"
                min={0}
                max={100}
                value={data.discountPct}
                onChange={(e) => set('discountPct', e.target.value)}
              />
            </label>
          )}

          {showBannerText ? (
            <label className={styles.field}>
              <span className={styles.label}>{pt.descriptionLabel}</span>
              <textarea
                className={styles.textarea}
                rows={3}
                value={data.description}
                onChange={(e) => set('description', e.target.value)}
              />
            </label>
          ) : (
            <label className={styles.field}>
              <span className={styles.label}>{pt.promoCodeLabel}</span>
              <input
                className={styles.input}
                type="text"
                value={data.promoCode}
                onChange={(e) => set('promoCode', e.target.value)}
                placeholder="SUMMER20"
              />
            </label>
          )}

          <div className={styles.grid2}>
            <label className={styles.field}>
              <span className={styles.label}>{pt.startDateLabel}</span>
              <input
                className={styles.input}
                type="date"
                value={data.startDate}
                onChange={(e) => set('startDate', e.target.value)}
                required
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>{pt.endDateLabel}</span>
              <input
                className={styles.input}
                type="date"
                value={data.endDate}
                onChange={(e) => set('endDate', e.target.value)}
              />
            </label>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancel} onClick={onClose}>
              {pt.cancelBtn}
            </button>
            <button type="submit" className={styles.save}>
              {pt.saveBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
