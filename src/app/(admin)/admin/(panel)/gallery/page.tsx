'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './gallery.module.css';
import { useAdminLocale } from '@/hooks/useAdminLocale';
import { getAdminT } from '@/lib/admin-i18n';

interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
}

export default function GalleryPage() {
  const { locale } = useAdminLocale();
  const t = getAdminT(locale);
  const tg = t.gallery;

  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cardFileRefs = useRef<Map<string, HTMLInputElement>>(new Map());

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

  async function uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', 'gallery');
    const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
    if (!res.ok) {
      const err = await res.json() as { error?: string; details?: string };
      throw new Error(err.details ?? err.error ?? 'Upload failed');
    }
    const { url } = await res.json() as { url: string };
    return url;
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading('new');
    try {
      for (const file of Array.from(files)) {
        const url = await uploadFile(file);
        await fetch('/api/admin/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, alt: file.name.replace(/\.[^.]+$/, '') }),
        });
      }
      await fetchImages();
    } catch (err) {
      alert(err instanceof Error ? err.message : tg.uploadError);
    } finally {
      setUploading(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleCardReplace = async (e: React.ChangeEvent<HTMLInputElement>, imageId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(imageId);
    try {
      const url = await uploadFile(file);
      await fetch('/api/admin/gallery', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: imageId, url }),
      });
      setImages(prev => prev.map(img => img.id === imageId ? { ...img, url } : img));
    } catch (err) {
      alert(err instanceof Error ? err.message : tg.uploadError);
    } finally {
      setUploading(null);
      const input = cardFileRefs.current.get(imageId);
      if (input) input.value = '';
    }
  };

  const deleteImage = async (img: GalleryImage) => {
    if (!confirm(tg.deleteConfirm)) return;
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
        <h1 className={styles.h1}>{tg.title}</h1>
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
            {uploading === 'new' ? tg.uploading : tg.addPhoto}
          </label>
        </div>
      </div>

      <p className={styles.hint}>{tg.hint}</p>

      {loading ? (
        <div className={styles.loading}>{tg.loading}</div>
      ) : images.length === 0 ? (
        <div className={styles.empty}>{tg.empty}</div>
      ) : (
        <div className={styles.grid}>
          {images.map((img) => (
            <div key={img.id} className={`${styles.card} ${!img.active ? styles.cardInactive : ''}`}>
              <div className={styles.imageWrap}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt} className={styles.image} />
                <div className={styles.overlay}>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    className={styles.fileInput}
                    id={`replace-${img.id}`}
                    ref={(el) => {
                      if (el) cardFileRefs.current.set(img.id, el);
                      else cardFileRefs.current.delete(img.id);
                    }}
                    onChange={(e) => void handleCardReplace(e, img.id)}
                  />
                  <label
                    htmlFor={`replace-${img.id}`}
                    className={styles.overlayBtn}
                    style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}
                    aria-disabled={!!uploading}
                  >
                    {uploading === img.id ? tg.uploading : tg.replace}
                  </label>
                  <button
                    type="button"
                    className={styles.overlayBtn}
                    onClick={() => void toggleActive(img)}
                  >
                    {img.active ? tg.hidePhoto : tg.showPhoto}
                  </button>
                  <button
                    type="button"
                    className={`${styles.overlayBtn} ${styles.overlayDelete}`}
                    onClick={() => void deleteImage(img)}
                  >
                    {tg.deletePhoto}
                  </button>
                </div>
              </div>
              <input
                type="text"
                className={styles.altInput}
                defaultValue={img.alt}
                placeholder={tg.altPlaceholder}
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
