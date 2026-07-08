'use client';

import { useState, useEffect, useRef } from 'react';
import AdminLoading from '@/components/admin/AdminLoading/AdminLoading';
import { useAdminLocale } from '@/hooks/useAdminLocale';
import { getAdminT } from '@/lib/admin-i18n';

interface HeroConfig {
  title: string;
  subtitle: string;
  ctaText: string;
  imageUrl?: string | null;
}

const DEFAULTS: HeroConfig = {
  title: '',
  subtitle: '',
  ctaText: 'Rezervovať termín',
  imageUrl: null,
};

export default function HeroAdminPage() {
  const { locale } = useAdminLocale();
  const t = getAdminT(locale);
  const h = t.hero;

  const [form, setForm] = useState<HeroConfig>(DEFAULTS);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [ogGenerating, setOgGenerating] = useState(false);
  const [ogUrl, setOgUrl] = useState<string | null>(null);
  const [ogError, setOgError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/admin/hero')
      .then((r) => (r.ok ? (r.json() as Promise<HeroConfig | null>) : null))
      .then((cfg) => {
        if (cfg) {
          setForm(cfg);
          setCurrentImageUrl(cfg.imageUrl ?? null);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);

    let imageUrl = form.imageUrl;

    const file = fileRef.current?.files?.[0];
    if (file) {
      setUploading(true);
      const fd = new FormData();
      fd.append('file', file);
      const up = await fetch('/api/admin/hero/upload', { method: 'POST', body: fd });
      setUploading(false);
      if (!up.ok) {
        const d = (await up.json()) as { error?: string };
        setError(d.error ?? h.uploadError);
        setSaving(false);
        return;
      }
      const { url } = (await up.json()) as { url: string };
      imageUrl = url;
    }

    const res = await fetch('/api/admin/hero', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, imageUrl }),
    });

    if (res.ok) {
      const updated = (await res.json()) as HeroConfig;
      setForm(updated);
      setCurrentImageUrl(updated.imageUrl ?? null);
      setPreviewUrl(null);
      setSaved(true);
      if (fileRef.current) fileRef.current.value = '';
    } else {
      const d = (await res.json()) as { error?: string };
      setError(d.error ?? h.saveError);
    }
    setSaving(false);
  }

  async function handleGenerateOg() {
    setOgGenerating(true);
    setOgError('');
    setOgUrl(null);
    try {
      const res = await fetch('/api/admin/og', { method: 'POST' });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setOgError(data.error ?? h.ogError);
      } else {
        setOgUrl(data.url);
      }
    } catch {
      setOgError(h.ogError);
    } finally {
      setOgGenerating(false);
    }
  }

  if (loading) return <AdminLoading rows={3} />;

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>{h.title}</h1>
        {saved && <span style={{ color: '#4ade80', fontSize: '0.875rem' }}>{h.saved}</span>}
      </div>

      <form onSubmit={save} className="admin-masters__form">
        <div className="admin-services__form-grid">
          <div className="booking__field" style={{ gridColumn: '1 / -1' }}>
            <label>{h.titleLabel}</label>
            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder=""
            />
          </div>
          <div className="booking__field" style={{ gridColumn: '1 / -1' }}>
            <label>{h.subtitleLabel}</label>
            <input
              value={form.subtitle}
              onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
              placeholder=""
            />
          </div>
          <div className="booking__field" style={{ gridColumn: '1 / -1' }}>
            <label>{h.ctaLabel}</label>
            <input
              value={form.ctaText}
              onChange={(e) => setForm((p) => ({ ...p, ctaText: e.target.value }))}
              placeholder="Rezervovať termín"
            />
          </div>

          <div className="booking__field" style={{ gridColumn: '1 / -1' }}>
            <label>{h.imageLabel}</label>

            {!previewUrl && currentImageUrl && (
              <div style={{ marginBottom: '1rem' }}>
                <p
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.8rem',
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {h.currentPhoto}
                </p>
                <img
                  src={currentImageUrl}
                  alt="Current hero"
                  style={{
                    width: '100%',
                    maxHeight: '260px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                  }}
                />
              </div>
            )}

            {previewUrl && (
              <div style={{ marginBottom: '1rem' }}>
                <p
                  style={{
                    color: 'var(--color-primary)',
                    fontSize: '0.8rem',
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {h.newPhotoUnsaved}
                </p>
                <img
                  src={previewUrl}
                  alt="New hero preview"
                  style={{
                    width: '100%',
                    maxHeight: '260px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '2px solid var(--color-primary)',
                  }}
                />
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ color: 'var(--color-text-secondary)' }}
            />
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-secondary)',
                marginTop: '0.35rem',
              }}
            >
              {h.hint}
            </span>
            {currentImageUrl && (
              <button
                type="button"
                className="btn-sm btn-danger"
                onClick={() => {
                  setForm((p) => ({ ...p, imageUrl: null }));
                  setCurrentImageUrl(null);
                  setPreviewUrl(null);
                }}
                style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}
              >
                {h.removePhoto}
              </button>
            )}
          </div>
        </div>

        {error && (
          <p style={{ color: 'var(--color-error, #ef4444)', marginTop: '0.5rem' }}>{error}</p>
        )}

        <div style={{ marginTop: '1.5rem' }}>
          <button
            type="submit"
            className="btn-primary btn-sm"
            disabled={saving || uploading}
          >
            {uploading ? h.uploading : saving ? t.common.saving : t.common.save}
          </button>
        </div>
      </form>

      {/* OG Image Generator */}
      <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
          OG Image (1200 × 630)
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
          {h.ogDescription}
        </p>

        {ogUrl && (
          <div style={{ marginBottom: '1rem' }}>
            <img
              src={ogUrl}
              alt="OG preview"
              style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--color-primary)' }}
            />
            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '0.4rem', wordBreak: 'break-all' }}>{ogUrl}</p>
          </div>
        )}

        {ogError && (
          <p style={{ color: 'var(--color-error, #ef4444)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{ogError}</p>
        )}

        <button
          type="button"
          className="btn-primary btn-sm"
          onClick={handleGenerateOg}
          disabled={ogGenerating}
        >
          {ogGenerating ? h.generatingOg : h.generateOg}
        </button>
      </div>
    </div>
  );
}
