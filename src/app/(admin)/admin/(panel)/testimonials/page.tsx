'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdminLocale } from '@/hooks/useAdminLocale';
import { getAdminT } from '@/lib/admin-i18n';

type Status = 'PENDING' | 'APPROVED' | 'REJECTED';

interface TestimonialRow {
  id: string;
  text: string;
  rating: number;
  status: Status;
  adminReply: string | null;
  customerName: string;
  createdAt: string;
}

interface AdminResponse {
  items: TestimonialRow[];
  counts: { all: number; pending: number; approved: number; rejected: number };
}

export default function AdminTestimonialsPage() {
  const { locale } = useAdminLocale();
  const t = getAdminT(locale);

  const [items, setItems] = useState<TestimonialRow[]>([]);
  const [counts, setCounts] = useState({ all: 0, pending: 0, approved: 0, rejected: 0 });
  const [filter, setFilter] = useState<Status | 'ALL'>('ALL');
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    const qs = filter === 'ALL' ? '' : `?status=${filter}`;
    const r = await fetch(`/api/admin/testimonials${qs}`);
    const data = await r.json() as AdminResponse;
    setItems(data.items ?? []);
    setCounts(data.counts ?? { all: 0, pending: 0, approved: 0, rejected: 0 });
  }, [filter]);

  useEffect(() => { void load(); }, [load]);

  async function setStatus(id: string, status: Status) {
    await fetch(`/api/admin/testimonials/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    await load();
  }

  async function saveReply(id: string) {
    setSaving(id);
    await fetch(`/api/admin/testimonials/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminReply: replyDraft[id] ?? '' }),
    });
    await load();
    setSaving(null);
  }

  async function deleteItem(id: string) {
    if (!confirm(t.reviews.deleteConfirm)) return;
    await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
    await load();
  }

  const STATUS_LABEL: Record<Status, string> = {
    PENDING:  t.reviews.pending,
    APPROVED: t.reviews.approved,
    REJECTED: t.reviews.rejected,
  };

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>
          {t.reviews.title}
          {counts.pending > 0 && (
            <span className="admin-badge">{counts.pending}</span>
          )}
        </h1>
      </div>

      <div className="admin-filter">
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`admin-filter__btn ${filter === s ? 'active' : ''}`}
          >
            {s === 'ALL'
              ? `${t.reviews.all} (${counts.all})`
              : s === 'PENDING'
              ? `${t.reviews.pending} (${counts.pending})`
              : s === 'APPROVED'
              ? `${t.reviews.approved} (${counts.approved})`
              : `${t.reviews.rejected} (${counts.rejected})`}
          </button>
        ))}
      </div>

      <div className="admin-testimonials__list">
        {items.map((item) => (
          <div key={item.id} className="admin-testimonials__item">
            <div className="admin-testimonials__meta">
              <strong>{item.customerName}</strong>
              <span style={{ color: 'var(--color-gold, #C96030)' }}>{'★'.repeat(item.rating)}</span>
              <span className={`status-badge status-badge--${item.status.toLowerCase()}`}>
                {STATUS_LABEL[item.status]}
              </span>
              <span className="admin-testimonials__date">
                {new Date(item.createdAt).toLocaleDateString('sk-SK')}
              </span>
            </div>

            <p className="admin-testimonials__content">&ldquo;{item.text}&rdquo;</p>

            {item.adminReply ? (
              <div className="admin-testimonials__existing-reply">
                <span className="admin-testimonials__reply-label">{t.reviews.yourReply}</span>
                <p>{item.adminReply}</p>
              </div>
            ) : null}

            <div className="admin-testimonials__reply">
              <label>{t.reviews.ownerReplyLabel}</label>
              <textarea
                rows={2}
                placeholder={t.reviews.yourReply}
                value={replyDraft[item.id] ?? item.adminReply ?? ''}
                onChange={(e) =>
                  setReplyDraft((p) => ({ ...p, [item.id]: e.target.value }))
                }
              />
              <button
                type="button"
                className="btn-sm btn-outline"
                onClick={() => void saveReply(item.id)}
                disabled={saving === item.id}
              >
                {saving === item.id ? t.common.saving : t.reviews.saveReply}
              </button>
            </div>

            <div className="admin-testimonials__actions">
              {item.status !== 'APPROVED' && (
                <button
                  type="button"
                  className="btn-sm btn-primary"
                  onClick={() => void setStatus(item.id, 'APPROVED')}
                >
                  ✓ {t.reviews.approve}
                </button>
              )}
              {item.status !== 'REJECTED' && (
                <button
                  type="button"
                  className="btn-sm btn-danger"
                  onClick={() => void setStatus(item.id, 'REJECTED')}
                >
                  ✕ {t.reviews.reject}
                </button>
              )}
              <button
                type="button"
                className="btn-sm btn-ghost"
                onClick={() => void deleteItem(item.id)}
              >
                {t.common.delete}
              </button>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <p style={{ color: 'var(--color-text-muted, #666)', padding: '2rem' }}>
            {t.common.noData}
          </p>
        )}
      </div>
    </div>
  );
}
