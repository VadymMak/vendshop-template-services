'use client';

import { useState, useRef } from 'react';
import type { Vertical } from '@prisma/client';
import styles from './ProductModal.module.css';

export interface ProductFormData {
  name: string;
  brand: string;
  category: string;
  price: string;
  oldPrice: string;
  inStock: boolean;
  image?: string;
  // RESTAURANT fields
  dietaryTags?: string[];
  allergens?: string;
  portion?: string;
  prepTime?: number;
  // FOOD_MARKET fields
  weight?: string;
  expiryDays?: string;
  temperature?: string;
  calories?: string;
  organic?: boolean;
}

export interface ProductModalProps {
  mode: 'add' | 'edit';
  initial: ProductFormData;
  categories: { id: string; slug: string; label: string }[];
  vertical?: Vertical;
  currency?: string;
  onSave: (data: ProductFormData) => void;
  onClose: () => void;
}

const DIETARY_TAGS = ['vegan', 'vegetarian', 'gluten-free', 'dairy-free', 'nut-free', 'spicy'] as const;
type DietaryTag = (typeof DIETARY_TAGS)[number];

const DIETARY_LABELS: Record<DietaryTag, string> = {
  vegan: '🌱 Vegan',
  vegetarian: '🥬 Vegetarian',
  'gluten-free': '🌾 Gluten-free',
  'dairy-free': '🥛 Dairy-free',
  'nut-free': '🥜 Nut-free',
  spicy: '🌶️ Spicy',
};

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export default function ProductModal({ mode, initial, categories, vertical, currency, onSave, onClose }: ProductModalProps) {
  const [data, setData] = useState<ProductFormData>(initial);
  const [dietaryTags, setDietaryTags] = useState<string[]>(initial.dietaryTags ?? []);
  const [allergens, setAllergens] = useState(initial.allergens ?? '');
  const [portion, setPortion] = useState(initial.portion ?? '');
  const [prepTime, setPrepTime] = useState(initial.prepTime ?? 0);
  const [imageUrl, setImageUrl] = useState(initial.image ?? '');
  const [imageUploading, setImageUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('purpose', 'product');
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        alert(err.error ?? 'Помилка завантаження');
        return;
      }
      const uploadData = await res.json() as { url: string };
      setImageUrl(uploadData.url);
    } catch {
      alert('Помилка завантаження');
    } finally {
      setImageUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const toggleDietaryTag = (tag: string) =>
    setDietaryTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  const isRestaurant = vertical === 'RESTAURANT';
  const isFood = vertical === 'FOOD_MARKET';
  const currencyLabel = currency === 'EUR' ? '€' : 'грн';

  const [foodWeight, setFoodWeight] = useState(initial.weight ?? '');
  const [foodExpiryDays, setFoodExpiryDays] = useState(initial.expiryDays ?? '');
  const [foodTemperature, setFoodTemperature] = useState(initial.temperature ?? 'room');
  const [foodCalories, setFoodCalories] = useState(initial.calories ?? '');
  const [foodOrganic, setFoodOrganic] = useState(initial.organic ?? false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave({
      ...data,
      image: imageUrl || undefined,
      ...(isRestaurant && { dietaryTags, allergens, portion, prepTime }),
      ...(isFood && {
        weight: foodWeight,
        expiryDays: foodExpiryDays,
        temperature: foodTemperature,
        calories: foodCalories,
        organic: foodOrganic,
      }),
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className={styles.head}>
          <h2 className={styles.title}>
            {mode === 'add'
              ? (isRestaurant ? 'Додати страву' : isFood ? 'Додати продукт' : 'Додати товар')
              : (isRestaurant ? 'Редагувати страву' : isFood ? 'Редагувати продукт' : 'Редагувати товар')}
          </h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Закрити">
            <CloseIcon />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.imageUpload}>
            {imageUrl && (
              <div className={styles.imagePreview}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Preview" className={styles.previewImg} />
              </div>
            )}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              className={styles.fileInput}
              onChange={handleImageUpload}
              id="product-image-upload"
            />
            <label htmlFor="product-image-upload" className={styles.uploadLabel}>
              {imageUploading ? 'Завантажую...' : (imageUrl ? 'Змінити фото' : 'Завантажити фото')}
            </label>
          </div>

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
              <span className={styles.label}>Ціна, {currencyLabel}</span>
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
              <span className={styles.label}>Стара ціна, {currencyLabel}</span>
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

          {isFood && (
            <div className={styles.foodFields}>
              <h3 className={styles.fieldGroupTitle}>Характеристики продукту</h3>
              <div className={styles.grid2}>
                <label className={styles.field}>
                  <span className={styles.label}>Вага / Об&#39;єм</span>
                  <input
                    className={styles.input}
                    type="text"
                    value={foodWeight}
                    onChange={(e) => setFoodWeight(e.target.value)}
                    placeholder="1 kg"
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>Термін зберігання (днів)</span>
                  <input
                    className={styles.input}
                    type="number"
                    min={0}
                    value={foodExpiryDays}
                    onChange={(e) => setFoodExpiryDays(e.target.value)}
                    placeholder="14"
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>Зберігання</span>
                  <select
                    className={styles.input}
                    value={foodTemperature}
                    onChange={(e) => setFoodTemperature(e.target.value)}
                  >
                    <option value="room">Кімнатне</option>
                    <option value="refrigerated">Холодильник</option>
                    <option value="frozen">Заморожене</option>
                  </select>
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>Калорії / 100г</span>
                  <input
                    className={styles.input}
                    type="number"
                    min={0}
                    value={foodCalories}
                    onChange={(e) => setFoodCalories(e.target.value)}
                    placeholder="52"
                  />
                </label>
              </div>
              <label className={styles.organicToggle}>
                <input
                  type="checkbox"
                  checked={foodOrganic}
                  onChange={(e) => setFoodOrganic(e.target.checked)}
                />
                <span>🌿 Органічний продукт</span>
              </label>
            </div>
          )}

          {isRestaurant && (
            <div className={styles.restaurantFields}>
              <h3 className={styles.fieldGroupTitle}>Деталі страви</h3>
              <div>
                <span className={styles.label}>Дієтичні мітки</span>
                <div className={styles.checkboxGroup}>
                  {DIETARY_TAGS.map((tag) => (
                    <label key={tag} className={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={dietaryTags.includes(tag)}
                        onChange={() => toggleDietaryTag(tag)}
                      />
                      {DIETARY_LABELS[tag]}
                    </label>
                  ))}
                </div>
              </div>
              <label className={styles.field}>
                <span className={styles.label}>Алергени (через кому)</span>
                <input
                  className={styles.input}
                  type="text"
                  value={allergens}
                  onChange={(e) => setAllergens(e.target.value)}
                  placeholder="горіхи, молоко, глютен..."
                />
              </label>
              <div className={styles.grid2}>
                <label className={styles.field}>
                  <span className={styles.label}>Порція</span>
                  <input
                    className={styles.input}
                    type="text"
                    value={portion}
                    onChange={(e) => setPortion(e.target.value)}
                    placeholder="350г"
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>Час приготування (хв)</span>
                  <input
                    className={styles.input}
                    type="number"
                    value={prepTime}
                    onChange={(e) => setPrepTime(parseInt(e.target.value, 10) || 0)}
                    min={0}
                  />
                </label>
              </div>
            </div>
          )}

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
