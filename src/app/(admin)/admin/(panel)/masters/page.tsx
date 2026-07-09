'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AdminLoading from '@/components/admin/AdminLoading/AdminLoading';
import { useAdminLocale } from '@/hooks/useAdminLocale';
import { getAdminT } from '@/lib/admin-i18n';

interface Master {
  id: string;
  name: string;
  role: string;
  bio?: string | null;
  photo?: string | null;
  active: boolean;
  sortOrder: number;
}

export default function MastersPage() {
  const { locale } = useAdminLocale();
  const t = getAdminT(locale);

  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const r = await fetch('/api/admin/masters');
    if (r.ok) setMasters(await r.json() as Master[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function remove(id: string, name: string) {
    if (!window.confirm(t.masters.deleteConfirm.replace('{name}', name))) return;
    await fetch(`/api/admin/masters/${id}`, { method: 'DELETE' });
    await load();
  }

  async function toggleActive(m: Master) {
    await fetch(`/api/admin/masters/${m.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !m.active }),
    });
    await load();
  }

  if (loading) return <AdminLoading rows={3} />;

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>{t.masters.title}</h1>
        <Link href="/admin/masters/new" className="btn-primary btn-sm">{t.masters.add}</Link>
      </div>

      <div className="admin-services__list">
          {masters.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', padding: '2rem' }}>
              {t.masters.noMasters}
            </p>
          ) : masters.map((m) => (
            <div
              key={m.id}
              className={`admin-services__item${m.active ? '' : ' admin-services__item--inactive'}`}
            >
              {m.photo && (
                <img
                  src={m.photo}
                  alt={m.name}
                  style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
              )}
              <div className="admin-services__info">
                <span className="admin-services__name">{m.name}</span>
                <span className="admin-services__desc">{m.role}</span>
                {m.bio && <span className="admin-services__meta">{m.bio}</span>}
              </div>

              <div className="admin-services__actions">
                <button
                  type="button"
                  className={`btn-sm ${m.active ? 'btn-outline' : 'btn-primary'}`}
                  onClick={() => toggleActive(m)}
                >
                  {m.active ? t.common.hide : t.common.show}
                </button>
                <Link href={`/admin/masters/${m.id}/edit`} className="btn-sm btn-outline">
                  {t.common.edit}
                </Link>
                <button
                  type="button"
                  className="btn-sm btn-danger"
                  onClick={() => remove(m.id, m.name)}
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
