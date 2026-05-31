'use client';

import { useState } from 'react';
import styles from './ProductModal.module.css';

export interface ProductFormData {
  name: string;
  brand: string;
  category: string;
  price: string;
  oldPrice: string;
  inStock: boolean;
}

export interface ProductModalProps {
  mode: 'add' | 'edit';
  initial: ProductFormData;
  categories: { slug: string; label: string }[];
  onSave: (data: ProductFormData) => void;
  onClose: () => void;
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export default function ProductModal({ mode, initial, categories, onSave, onClose }: ProductModalProps) {
  const [data, setData] = useState<ProductFormData>(initial);

  const set = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(data);
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className={styles.head}>
          <h2 className={styles.title}>{mode === 'add' ? 'Додати товар' : 'Редагувати товар'}</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Закрити">
            <CloseIcon />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>Назва</span>
            <input
              className={styles.input}
              type="text"
              value={data.name}
              onChange={(e) => set('name', e.target.value)}
              required
            />
          </label>

          <div className={styles.grid2}>
            <label className={styles.field}>
              <span className={styles.label}>Бренд</span>
              <input
                className={styles.input}
                type="text"
                value={data.brand}
                onChange={(e) => set('brand', e.target.value)}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Категорія</span>
              <select
                className={styles.input}
                value={data.category}
                onChange={(e) => set('category', e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Ціна, грн</span>
              <input
                className={styles.input}
                type="number"
                min={0}
                value={data.price}
                onChange={(e) => set('price', e.target.value)}
                required
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Стара ціна, грн</span>
              <input
                className={styles.input}
                type="number"
                min={0}
                value={data.oldPrice}
                onChange={(e) => set('oldPrice', e.target.value)}
              />
            </label>
          </div>

          <label className={styles.toggleRow}>
            <span className={styles.label}>Наявність</span>
            <span className={styles.toggle}>
              <input
                type="checkbox"
                checked={data.inStock}
                onChange={(e) => set('inStock', e.target.checked)}
              />
              <span className={styles.track} />
            </span>
          </label>

          <div className={styles.actions}>
            <button type="button" className={styles.cancel} onClick={onClose}>
              Скасувати
            </button>
            <button type="submit" className={styles.save}>
              Зберегти
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
