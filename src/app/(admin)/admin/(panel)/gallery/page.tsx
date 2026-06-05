'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './gallery.module.css';

interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/gallery');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json() as { images?: GalleryImage[] };
      setImages(data.images ?? []);
    } catch (err) {
      console.error('Failed to load gallery:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('purpose', 'gallery');
        const uploadRes = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });
        if (!uploadRes.ok) {
          const err = await uploadRes.json() as { error?: string };
          alert(err.error ?? 'Upload failed');
          continue;
        }
        const { url } = await uploadRes.json() as { url: string };

        await fetch('/api/admin/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, alt: file.name.replace(/\.[^.]+$/, '') }),
        });
      }
      await fetchImages();
    } catch {
      alert('Помилка завантаження');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const deleteImage = async (img: GalleryImage) => {
    if (!confirm('Видалити це фото?')) return;
    await fetch(`/api/admin/gallery?id=${img.id}`, { method: 'DELETE' });
    await fetchImages();
  };

  const toggleActive = async (img: GalleryImage) => {
    await fetch('/api/admin/gallery', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: img.id, active: !img.active }),
    });
    await fetchImages();
  };

  const updateAlt = async (img: GalleryImage, alt: string) => {
    await fetch('/api/admin/gallery', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: img.id, alt }),
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <h1 className={styles.h1}>Галерея</h1>
        <div className={styles.uploadArea}>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            multiple
            className={styles.fileInput}
            onChange={handleUpload}
            id="gallery-upload"
          />
          <label htmlFor="gallery-upload" className={styles.uploadBtn}>
            {uploading ? 'Завантажую...' : '↑ Завантажити файл'}
          </label>
        </div>
      </div>

      <p className={styles.hint}>
        Фото автоматично оптимізуються (WebP, макс. 1200×800). Підтримувані формати: JPEG, PNG, WebP, GIF, AVIF. Макс. 10MB.
      </p>

      {loading ? (
        <div className={styles.loading}>Завантаження...</div>
      ) : images.length === 0 ? (
        <div className={styles.empty}>
          Галерея порожня — завантажте перше фото
        </div>
      ) : (
        <div className={styles.grid}>
          {images.map((img) => (
            <div key={img.id} className={`${styles.card} ${!img.active ? styles.cardInactive : ''}`}>
              <div className={styles.imageWrap}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt} className={styles.image} />
                <div className={styles.overlay}>
                  <button
                    type="button"
                    className={styles.overlayBtn}
                    onClick={() => void toggleActive(img)}
                  >
                    {img.active ? 'Сховати' : 'Показати'}
                  </button>
                  <button
                    type="button"
                    className={`${styles.overlayBtn} ${styles.overlayDelete}`}
                    onClick={() => void deleteImage(img)}
                  >
                    Видалити
                  </button>
                </div>
              </div>
              <input
                type="text"
                className={styles.altInput}
                defaultValue={img.alt}
                placeholder="Опис фото..."
                onBlur={(e) => void updateAlt(img, e.target.value)}
              />
              <span className={styles.order}>#{img.sortOrder + 1}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
