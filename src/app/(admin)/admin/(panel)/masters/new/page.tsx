'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminLocale } from '@/hooks/useAdminLocale';
import { getAdminT } from '@/lib/admin-i18n';

const EMPTY = { name: '', role: '', bio: '' };

export default function NewMasterPage() {
  const router = useRouter();
  const { locale } = useAdminLocale();
  const t = getAdminT(locale);

  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.role.trim()) return;
    setSaving(true);
    setError('');

    let photoUrl: string | undefined;

    const file = fileRef.current?.files?.[0];
    if (file) {
      setUploading(true);
      const fd = new FormData();
      fd.append('file', file);
      fd.append('purpose', 'master');
      const up = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      setUploading(false);
      if (!up.ok) {
        const d = await up.json() as { error?: string };
        setError(d.error ?? t.masters.photoUploadError);
        setSaving(false);
        return;
      }
      const { url } = await up.json() as { url: string };
      photoUrl = url;
    }

    const res = await fetch('/api/admin/masters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        role: form.role,
        bio: form.bio || undefined,
        photo: photoUrl,
      }),
    });

    if (res.ok) {
      router.push('/admin/masters');
    } else {
      const data = await res.json() as { error?: string };
      setError(data.error ?? t.hero.saveError);
      setSaving(false);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>{t.masters.newTitle}</h1>
        <Link href="/admin/masters" className="btn-outline btn-sm">{t.masters.backLink}</Link>
      </div>

      <form onSubmit={submit} className="admin-masters__form">
        <div className="admin-services__form-grid">
          <div className="booking__field">
            <label>{t.masters.nameLabel} *</label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Ján Novák"
              required
            />
          </div>
          <div className="booking__field">
            <label>{t.masters.roleLabel} *</label>
            <input
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              placeholder="Barber, Stylista..."
              required
            />
          </div>
          <div className="booking__field" style={{ gridColumn: '1 / -1' }}>
            <label>{t.masters.photoLabel}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {preview && (
                <img
                  src={preview}
                  alt="preview"
                  style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                style={{ color: 'var(--color-text-secondary, #b0a898)' }}
              />
            </div>
          </div>
          <div className="booking__field" style={{ gridColumn: '1 / -1' }}>
            <label>{t.masters.bioLabel}</label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              placeholder={t.masters.bioPlaceholder}
            />
          </div>
        </div>

        {error && (
          <p style={{ color: 'var(--color-error, #ef4444)', marginTop: '0.5rem' }}>{error}</p>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <button
            type="submit"
            className="btn-primary btn-sm"
            disabled={saving || uploading || !form.name.trim() || !form.role.trim()}
          >
            {uploading ? t.common.uploading : saving ? t.common.saving : t.masters.saveBtn}
          </button>
          <Link href="/admin/masters" className="btn-outline btn-sm">{t.common.cancel}</Link>
        </div>
      </form>
    </div>
  );
}
