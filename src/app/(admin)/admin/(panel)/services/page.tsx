'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdminLocale } from '@/hooks/useAdminLocale';
import { getAdminT } from '@/lib/admin-i18n';
import AdminLoading from '@/components/admin/AdminLoading/AdminLoading';

interface Service {
  id: string;
  nameKey: string;
  description?: string | null;
  price: number;
  duration?: number | null;
  category?: string | null;
  active: boolean;
}

const EMPTY = { nameKey: '', description: '', price: 0, duration: 30, category: '' };

export default function AdminServicesPage() {
  const { locale } = useAdminLocale();
  const t = getAdminT(locale);

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/services');
      if (r.ok) setServices(await r.json() as Service[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  function startEdit(s: Service) {
    setEditId(s.id);
    setForm({
      nameKey: s.nameKey,
      description: s.description ?? '',
      price: s.price,
      duration: s.duration ?? 30,
      category: s.category ?? '',
    });
    setShowAdd(false);
  }

  function cancelForm() {
    setEditId(null);
    setShowAdd(false);
    setForm(EMPTY);
  }

  async function save() {
    if (!form.nameKey.trim()) return;
    setSaving(true);

    const payload = {
      nameKey: form.nameKey,
      description: form.description,
      price: Number(form.price),
      duration: Number(form.duration),
      category: form.category || undefined,
    };

    if (editId) {
      await fetch(`/api/admin/services/${editId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    cancelForm();
    await load();
    setSaving(false);
  }

  async function toggleActive(s: Service) {
    await fetch(`/api/admin/services/${s.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !s.active }),
    });
    await load();
  }

  async function remove(id: string) {
    if (!window.confirm(t.services.confirmDelete)) return;
    await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
    await load();
  }

  if (loading) return <AdminLoading rows={4} />;

  const isEditing = editId !== null || showAdd;

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>{t.services.title}</h1>
        {!isEditing && (
          <button
            type="button"
            className="btn-primary btn-sm"
            onClick={() => { setShowAdd(true); setEditId(null); setForm(EMPTY); }}
          >
            {t.services.addService}
          </button>
        )}
      </div>

      {/* Add / Edit form */}
      {isEditing && (
        <div className="admin-services__form">
          <h3>{editId ? t.services.editService : t.services.newService}</h3>
          <div className="admin-services__form-grid">
            <div className="booking__field">
              <label>{t.services.nameLabel} *</label>
              <input
                value={form.nameKey}
                onChange={(e) => setForm((p) => ({ ...p, nameKey: e.target.value }))}
                placeholder="Pánsky strih"
              />
            </div>
            <div className="booking__field">
              <label>{t.services.priceLabel} *</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={form.price}
                onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
              />
            </div>
            <div className="booking__field">
              <label>{t.services.durationLabel}</label>
              <input
                type="number"
                min="5"
                step="5"
                value={form.duration ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, duration: Number(e.target.value) }))}
              />
            </div>
            <div className="booking__field">
              <label>{t.services.categoryLabel}</label>
              <input
                value={form.category ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                placeholder="Hair, Beard..."
              />
            </div>
            <div className="booking__field" style={{ gridColumn: '1 / -1' }}>
              <label>{t.services.descriptionLabel}</label>
              <textarea
                rows={2}
                value={form.description ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Krátky popis služby..."
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              className="btn-primary btn-sm"
              onClick={save}
              disabled={saving || !form.nameKey.trim()}
            >
              {saving ? t.common.saving : t.common.save}
            </button>
            <button type="button" className="btn-outline btn-sm" onClick={cancelForm}>
              {t.common.cancel}
            </button>
          </div>
        </div>
      )}

      {/* Services list */}
      <div className="admin-services__list">
        {services.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', padding: '2rem' }}>
            {t.services.noServices}
          </p>
        ) : services.map((s) => (
          <div
            key={s.id}
            className={`admin-services__item${s.active ? '' : ' admin-services__item--inactive'}`}
          >
            <div className="admin-services__info">
              <span className="admin-services__name">
                {t.services.names[s.nameKey] ?? s.nameKey}
              </span>
              {s.description && (
                <span className="admin-services__desc">{s.description}</span>
              )}
              <span className="admin-services__meta">
                {[s.duration ? `${s.duration} min` : null, s.category].filter(Boolean).join(' · ')}
              </span>
            </div>

            <div className="admin-services__price">€{s.price}</div>

            <div className="admin-services__actions">
              <button
                type="button"
                className={`btn-sm ${s.active ? 'btn-outline' : 'btn-primary'}`}
                onClick={() => toggleActive(s)}
                title={s.active ? 'Skryť zo stránky' : 'Zobraziť na stránke'}
              >
                {s.active ? t.common.hide : t.common.show}
              </button>
              <button
                type="button"
                className="btn-sm btn-outline"
                onClick={() => startEdit(s)}
              >
                {t.common.edit}
              </button>
              <button
                type="button"
                className="btn-sm btn-danger"
                onClick={() => remove(s.id)}
              >
                {t.common.delete}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
