'use client';

import { useAdminLocale } from '@/hooks/useAdminLocale';
import { getAdminT } from '@/lib/admin-i18n';
import type { HoursMap } from '@/lib/formatHours';

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
type DayKey = typeof DAY_KEYS[number];

export type { HoursMap };

export const DEFAULT_HOURS: HoursMap = {
  mon: { open: '09:00', close: '18:00' },
  tue: { open: '09:00', close: '18:00' },
  wed: { open: '09:00', close: '18:00' },
  thu: { open: '09:00', close: '18:00' },
  fri: { open: '09:00', close: '18:00' },
  sat: { open: '09:00', close: '17:00' },
  sun: null,
};

interface Props {
  value: HoursMap;
  onChange: (hours: HoursMap) => void;
}

const inputStyle: React.CSSProperties = {
  background: 'var(--admin-bg)',
  border: '1px solid var(--admin-border)',
  color: 'var(--admin-text)',
  borderRadius: '6px',
  padding: '0.3rem 0.5rem',
  fontSize: '0.875rem',
  colorScheme: 'light',
  fontFamily: 'inherit',
};

export default function WorkingHoursEditor({ value, onChange }: Props) {
  const { locale } = useAdminLocale();
  const t = getAdminT(locale);

  function toggleDay(key: DayKey, enabled: boolean) {
    onChange({
      ...value,
      [key]: enabled ? { open: '09:00', close: '18:00' } : null,
    });
  }

  function updateTime(key: DayKey, field: 'open' | 'close', time: string) {
    const current = value[key];
    if (!current) return;
    onChange({ ...value, [key]: { ...current, [field]: time } });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {DAY_KEYS.map((key) => {
        const hours = value[key];
        const isOpen = hours !== null;
        const label = t.settings.days[key];
        return (
          <div
            key={key}
            style={{
              display: 'grid',
              gridTemplateColumns: '120px 48px 1fr',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.6rem 0.75rem',
              background: 'var(--admin-bg-subtle)',
              border: '1px solid var(--admin-border)',
              borderRadius: '8px',
            }}
          >
            <span
              style={{
                color: isOpen ? 'var(--admin-text)' : 'var(--admin-text-muted)',
                fontWeight: isOpen ? 500 : 400,
                fontSize: '0.9rem',
              }}
            >
              {label}
            </span>

            <label
              style={{
                position: 'relative',
                display: 'inline-block',
                width: '40px',
                height: '22px',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <input
                type="checkbox"
                checked={isOpen}
                onChange={(e) => toggleDay(key, e.target.checked)}
                style={{ display: 'none' }}
              />
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: isOpen ? 'var(--admin-kate-bronze)' : 'var(--admin-text-faint)',
                  borderRadius: '11px',
                  transition: 'background 0.2s',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: '3px',
                  left: isOpen ? '21px' : '3px',
                  width: '16px',
                  height: '16px',
                  background: '#fff',
                  borderRadius: '50%',
                  transition: 'left 0.2s',
                }}
              />
            </label>

            {isOpen ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="time"
                  value={hours!.open}
                  onChange={(e) => updateTime(key, 'open', e.target.value)}
                  style={inputStyle}
                />
                <span style={{ color: 'var(--admin-text-muted)' }}>—</span>
                <input
                  type="time"
                  value={hours!.close}
                  onChange={(e) => updateTime(key, 'close', e.target.value)}
                  style={inputStyle}
                />
              </div>
            ) : (
              <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>{t.settings.closedLabel}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
