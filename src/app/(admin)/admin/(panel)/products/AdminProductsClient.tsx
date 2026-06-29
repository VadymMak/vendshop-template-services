'use client';

import { useState, useRef } from 'react';
import { SUPPORTED_LOCALES, LOCALE_LABELS, type SupportedLocale } from '@/lib/constants';

interface Translation {
  locale: string;
  name: string;
  description: string;
}

interface DigitalProduct {
  id: string;
  slug: string;
  price: number;
  currency: string;
  previewUrl: string | null;
  fileUrl: string | null;
  active: boolean;
  sortOrder: number;
  translations: Translation[];
}

type TranslationMap = Record<SupportedLocale, { name: string; description: string }>;

const EMPTY_TRANSLATIONS: TranslationMap = {
  sk: { name: '', description: '' },
  en: { name: '', description: '' },
  uk: { name: '', description: '' },
  cs: { name: '', description: '' },
  de: { name: '', description: '' },
};

const CURRENCIES = ['EUR', 'CZK', 'UAH'];

function translationsToMap(list: Translation[]): TranslationMap {
  const map = structuredClone(EMPTY_TRANSLATIONS);
  for (const t of list) {
    if (SUPPORTED_LOCALES.includes(t.locale as SupportedLocale)) {
      map[t.locale as SupportedLocale] = { name: t.name, description: t.description };
    }
  }
  return map;
}

interface Props {
  initialProducts: DigitalProduct[];
}

export default function AdminDigitalProductsClient({ initialProducts }: Props) {
  const [products, setProducts] = useState<DigitalProduct[]>(initialProducts);
  const [editing, setEditing] = useState<DigitalProduct | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [slug, setSlug] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [previewUrl, setPreviewUrl] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [activeLocale, setActiveLocale] = useState<SupportedLocale>('sk');
  const [translations, setTranslations] = useState<TranslationMap>(EMPTY_TRANSLATIONS);

  const [uploadingPreview, setUploadingPreview] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const previewRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function openCreate() {
    setEditing(null);
    setSlug('');
    setPrice('');
    setCurrency('EUR');
    setPreviewUrl('');
    setFileUrl('');
    setTranslations(structuredClone(EMPTY_TRANSLATIONS));
    setActiveLocale('sk');
    setError('');
    setCreating(true);
  }

  function openEdit(p: DigitalProduct) {
    setCreating(false);
    setSlug(p.slug);
    setPrice(String(p.price));
    setCurrency(p.currency);
    setPreviewUrl(p.previewUrl ?? '');
    setFileUrl(p.fileUrl ?? '');
    setTranslations(translationsToMap(p.translations));
    setActiveLocale('sk');
    setError('');
    setEditing(p);
  }

  function closeForm() {
    setCreating(false);
    setEditing(null);
    setError('');
  }

  async function uploadAsset(file: File, purpose: 'preview' | 'file'): Promise<string> {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('purpose', purpose);
    const res = await fetch('/api/admin/products/upload', { method: 'POST', body: fd });
    const data = await res.json() as { url?: string; error?: string; details?: string };
    if (!res.ok) throw new Error(data.details ?? data.error ?? 'Upload failed');
    return data.url!;
  }

  async function handlePreviewUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPreview(true);
    try {
      const url = await uploadAsset(file, 'preview');
      setPreviewUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba pri nahrávaní');
    }
    setUploadingPreview(false);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    try {
      const url = await uploadAsset(file, 'file');
      setFileUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba pri nahrávaní');
    }
    setUploadingFile(false);
  }

  async function handleSave() {
    setSaving(true);
    setError('');

    const translationsArray = SUPPORTED_LOCALES
      .filter((loc) => translations[loc].name.trim())
      .map((loc) => ({
        locale: loc,
        name: translations[loc].name.trim(),
        description: translations[loc].description.trim() || undefined,
      }));

    if (!slug.trim() || !price || !translationsArray.length) {
      setError('Vyplňte slug, cenu a aspoň jeden preklad (SK)');
      setSaving(false);
      return;
    }

    const body = {
      slug: slug.trim(),
      price: parseFloat(price),
      currency,
      previewUrl: previewUrl || null,
      fileUrl: fileUrl || null,
      translations: translationsArray,
    };

    try {
      const url = editing ? `/api/admin/products/${editing.id}` : '/api/admin/products';
      const method = editing ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json() as DigitalProduct & { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Uloženie zlyhalo');

      if (editing) {
        setProducts((prev) => prev.map((p) => (p.id === data.id ? data : p)));
      } else {
        setProducts((prev) => [...prev, data]);
      }
      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba');
    }
    setSaving(false);
  }

  async function handleToggleActive(p: DigitalProduct) {
    const res = await fetch(`/api/admin/products/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !p.active }),
    });
    if (res.ok) {
      const updated = await res.json() as DigitalProduct;
      setProducts((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Naozaj vymazať produkt?')) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    if (res.ok) setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  const formOpen = creating || !!editing;

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>Digitálne produkty</h1>
        {!formOpen && (
          <button className="btn-primary btn-sm" onClick={openCreate}>
            + Pridať produkt
          </button>
        )}
      </div>

      {formOpen && (
        <div className="admin-masters__form" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--color-text)' }}>
            {editing ? 'Upraviť produkt' : 'Nový produkt'}
          </h2>

          <div className="admin-services__form-grid">
            <div className="booking__field">
              <label>Slug (URL identifikátor)</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="napr. striharsky-manual"
              />
            </div>
            <div className="booking__field">
              <label>Cena</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="9.90"
              />
            </div>
            <div className="booking__field">
              <label>Mena</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                style={{
                  background: 'var(--color-bg-subtle)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--border-radius-md, 4px)',
                  padding: '0.5rem',
                }}
              >
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="admin-services__form-grid" style={{ marginTop: '1rem' }}>
            <div className="booking__field">
              <label>Obrázok náhľadu</label>
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="preview"
                  style={{
                    width: '100%',
                    maxHeight: '160px',
                    objectFit: 'cover',
                    borderRadius: '6px',
                    marginBottom: '0.5rem',
                    border: '1px solid var(--color-border)',
                  }}
                />
              )}
              <input
                ref={previewRef}
                type="file"
                accept="image/*"
                onChange={handlePreviewUpload}
                style={{ color: 'var(--color-text-secondary)' }}
              />
              {uploadingPreview && (
                <span style={{ fontSize: '0.75rem', color: 'var(--color-copper, #B87333)' }}>Nahrávam...</span>
              )}
            </div>
            <div className="booking__field">
              <label>Súbor produktu (PDF / zip)</label>
              {fileUrl && (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.75rem', color: 'var(--color-copper, #B87333)', display: 'block', marginBottom: '0.4rem' }}
                >
                  Aktuálny súbor ↗
                </a>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.zip,.epub"
                onChange={handleFileUpload}
                style={{ color: 'var(--color-text-secondary)' }}
              />
              {uploadingFile && (
                <span style={{ fontSize: '0.75rem', color: 'var(--color-copper, #B87333)' }}>Nahrávam...</span>
              )}
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              Preklady
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {SUPPORTED_LOCALES.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setActiveLocale(loc)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--border-radius-md, 4px)',
                    background: activeLocale === loc ? 'var(--color-copper, #B87333)' : 'var(--color-bg-subtle, rgba(0,0,0,0.4))',
                    color: activeLocale === loc ? '#fff' : 'var(--color-text-muted)',
                    border: '1px solid var(--color-border)',
                    cursor: 'pointer',
                    fontWeight: activeLocale === loc ? 600 : 400,
                    fontSize: '0.8rem',
                    transition: 'var(--transition, 0.25s ease)',
                  }}
                >
                  {LOCALE_LABELS[loc]}
                  {translations[loc].name.trim() && (
                    <span style={{ marginLeft: '0.3rem', fontSize: '0.65rem', opacity: 0.7 }}>✓</span>
                  )}
                </button>
              ))}
            </div>

            <div className="booking__field">
              <label>Názov ({activeLocale.toUpperCase()})</label>
              <input
                placeholder={`Názov produktu (${activeLocale})`}
                value={translations[activeLocale].name}
                onChange={(e) =>
                  setTranslations((prev) => ({
                    ...prev,
                    [activeLocale]: { ...prev[activeLocale], name: e.target.value },
                  }))
                }
              />
            </div>
            <div className="booking__field" style={{ marginTop: '0.75rem' }}>
              <label>Popis ({activeLocale.toUpperCase()})</label>
              <textarea
                rows={3}
                placeholder={`Popis produktu (${activeLocale})`}
                value={translations[activeLocale].description}
                onChange={(e) =>
                  setTranslations((prev) => ({
                    ...prev,
                    [activeLocale]: { ...prev[activeLocale], description: e.target.value },
                  }))
                }
                style={{
                  width: '100%',
                  background: 'var(--color-bg-subtle)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--border-radius-md, 4px)',
                  padding: '0.5rem',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>

          {error && (
            <p style={{ color: 'var(--color-error, #ef4444)', marginTop: '0.75rem', fontSize: '0.875rem' }}>{error}</p>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              className="btn-primary btn-sm"
              onClick={() => void handleSave()}
              disabled={saving || uploadingPreview || uploadingFile}
            >
              {saving ? 'Ukladám...' : 'Uložiť'}
            </button>
            <button
              type="button"
              onClick={closeForm}
              style={{
                background: 'transparent',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
                borderRadius: 'var(--border-radius-md, 4px)',
                padding: '0.4rem 1rem',
                cursor: 'pointer',
              }}
            >
              Zrušiť
            </button>
          </div>
        </div>
      )}

      {products.length === 0 && !formOpen && (
        <p style={{ color: 'var(--color-text-muted)', padding: '2rem 0' }}>
          Zatiaľ žiadne digitálne produkty. Kliknite „+ Pridať produkt".
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {products.map((p) => {
          const skName = p.translations.find((t) => t.locale === 'sk')?.name ?? p.slug;
          return (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.875rem 1rem',
                background: 'var(--color-bg-subtle)',
                borderRadius: 'var(--border-radius-lg, 8px)',
                border: '1px solid var(--color-border)',
                opacity: p.active ? 1 : 0.5,
              }}
            >
              {p.previewUrl && (
                <img
                  src={p.previewUrl}
                  alt={skName}
                  style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, color: 'var(--color-text)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {skName}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '0.2rem 0 0' }}>
                  {p.price} {p.currency} · /{p.slug}
                  {!p.active && ' · skrytý'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <button
                  className="btn-sm"
                  onClick={() => openEdit(p)}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-secondary)',
                    borderRadius: 'var(--border-radius-md, 4px)',
                    padding: '0.3rem 0.7rem',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                  }}
                >
                  Upraviť
                </button>
                <button
                  className="btn-sm"
                  onClick={() => void handleToggleActive(p)}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-muted)',
                    borderRadius: 'var(--border-radius-md, 4px)',
                    padding: '0.3rem 0.7rem',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                  }}
                >
                  {p.active ? 'Skryť' : 'Zobraziť'}
                </button>
                <button
                  className="btn-sm btn-danger"
                  onClick={() => void handleDelete(p.id)}
                  style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
                >
                  Vymazať
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
