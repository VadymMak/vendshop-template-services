'use client';

import { useEffect, useState } from 'react';
import styles from './theme.module.css';
import { DEFAULT_THEME, type ThemeConfig } from '@/lib/theme';
import { THEME_PRESETS } from '@/lib/theme-presets';
import { useAdminLocale } from '@/hooks/useAdminLocale';
import { getAdminT } from '@/lib/admin-i18n';

const COLOR_KEYS: (keyof ThemeConfig['colors'])[] = [
  'bg', 'primary', 'primaryDark', 'primaryLight',
  'text', 'textSecondary', 'textMuted', 'border', 'bgSubtle',
  'success', 'error', 'contrast', 'overlay', 'overlayAlpha', 'headerBg',
];

const HERO_OPTIONS: ThemeConfig['layout']['heroType'][]       = ['full-width', 'split', 'minimal'];
const CARD_OPTIONS: ThemeConfig['layout']['cardStyle'][]      = ['shadow', 'border', 'flat'];
const NAV_OPTIONS: ThemeConfig['layout']['navPosition'][]     = ['top', 'side'];
const RADIUS_OPTIONS: ThemeConfig['layout']['borderRadius'][] = ['sharp', 'rounded', 'pill'];

function borderRadiusValue(v: ThemeConfig['layout']['borderRadius']) {
  if (v === 'pill') return '9999px';
  if (v === 'rounded') return '8px';
  return '2px';
}

export default function ThemeEditorPage() {
  const [theme, setTheme] = useState<ThemeConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const { locale } = useAdminLocale();
  const t = getAdminT(locale);

  useEffect(() => {
    fetch('/api/admin/theme').then((r) => r.json()).then(setTheme);
  }, []);

  const save = async () => {
    if (!theme) return;
    setSaving(true);
    const res = await fetch('/api/admin/theme', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(theme),
    });
    const data = await res.json();
    if (data.success) {
      setToast('Theme saved! Refresh storefront to see changes.');
      setTimeout(() => setToast(''), 3000);
    }
    setSaving(false);
  };

  const resetColors = () => {
    if (!theme) return;
    setTheme({ ...theme, colors: { ...DEFAULT_THEME.colors } });
  };

  if (!theme) return <div className={styles.loading}>{t.common.loading}</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.h1}>{t.theme.title}</h1>
        <div className={styles.actions}>
          <button className={styles.resetBtn} onClick={resetColors}>{t.theme.resetColors}</button>
          <button className={styles.saveBtn} onClick={save} disabled={saving}>
            {saving ? t.theme.saving : t.theme.saveTheme}
          </button>
        </div>
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}

      <section className={styles.section} style={{ marginBottom: '24px' }}>
        <h2 className={styles.h2}>{t.theme.presetsTitle}</h2>
        <p className={styles.presetsHint}>{t.theme.presetsSubtitle}</p>
        <div className={styles.presetsGrid}>
          {THEME_PRESETS.map((preset) => (
            <button
              key={preset.id}
              className={styles.presetCard}
              onClick={() => setTheme(preset.theme)}
              type="button"
            >
              <div className={styles.presetColors}>
                <span className={styles.presetSwatch} style={{ background: preset.theme.colors.primary }} />
                <span className={styles.presetSwatch} style={{ background: preset.theme.colors.primaryDark }} />
                <span className={styles.presetSwatch} style={{ background: preset.theme.colors.text }} />
                <span className={styles.presetSwatch} style={{ background: preset.theme.colors.bgSubtle }} />
              </div>
              <span className={styles.presetName}>{preset.name}</span>
              <span className={styles.presetDesc}>{preset.description}</span>
            </button>
          ))}
        </div>
      </section>

      <div className={styles.grid}>
        {/* Colors Section */}
        <section className={styles.section}>
          <h2 className={styles.h2}>{t.theme.colors}</h2>
          <div className={styles.colorGrid}>
            {COLOR_KEYS.map((key) => (
              <div key={key} className={styles.colorField}>
                <label className={styles.colorLabel}>
                  <input
                    type="color"
                    value={theme.colors[key]}
                    onChange={(e) => setTheme({
                      ...theme,
                      colors: { ...theme.colors, [key]: e.target.value },
                    })}
                    className={styles.colorInput}
                  />
                  <span className={styles.colorName}>
                    {t.theme.colorLabels[key] ?? key}
                  </span>
                </label>
                <span className={styles.colorHint}>
                  {t.theme.colorDescriptions[key] ?? ''}
                </span>
                <input
                  type="text"
                  value={theme.colors[key]}
                  onChange={(e) => setTheme({
                    ...theme,
                    colors: { ...theme.colors, [key]: e.target.value },
                  })}
                  className={styles.hexInput}
                  pattern="^#[0-9a-fA-F]{6}$"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Layout Section */}
        <section className={styles.section}>
          <h2 className={styles.h2}>{t.theme.layout}</h2>

          <div className={styles.layoutField}>
            <label className={styles.layoutLabel}>{t.theme.heroType}</label>
            <div className={styles.optionGroup}>
              {HERO_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  className={`${styles.optionBtn} ${theme.layout.heroType === opt ? styles.optionActive : ''}`}
                  onClick={() => setTheme({ ...theme, layout: { ...theme.layout, heroType: opt } })}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.layoutField}>
            <label className={styles.layoutLabel}>{t.theme.cardStyle}</label>
            <div className={styles.optionGroup}>
              {CARD_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  className={`${styles.optionBtn} ${theme.layout.cardStyle === opt ? styles.optionActive : ''}`}
                  onClick={() => setTheme({ ...theme, layout: { ...theme.layout, cardStyle: opt } })}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.layoutField}>
            <label className={styles.layoutLabel}>{t.theme.navigation}</label>
            <div className={styles.optionGroup}>
              {NAV_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  className={`${styles.optionBtn} ${theme.layout.navPosition === opt ? styles.optionActive : ''}`}
                  onClick={() => setTheme({ ...theme, layout: { ...theme.layout, navPosition: opt } })}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.layoutField}>
            <label className={styles.layoutLabel}>{t.theme.borderRadius}</label>
            <div className={styles.optionGroup}>
              {RADIUS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  className={`${styles.optionBtn} ${theme.layout.borderRadius === opt ? styles.optionActive : ''}`}
                  onClick={() => setTheme({ ...theme, layout: { ...theme.layout, borderRadius: opt } })}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Live Preview */}
        <section className={styles.section}>
          <h2 className={styles.h2}>{t.theme.preview}</h2>
          <div className={styles.preview}>
            <div className={styles.previewCard}>
              <div className={styles.previewHeader} style={{ background: theme.colors.primary, color: '#fff' }}>
                Header
              </div>
              <div className={styles.previewBody}>
                <p style={{ color: theme.colors.text }}>Primary text</p>
                <p style={{ color: theme.colors.textSecondary }}>Secondary text</p>
                <button style={{
                  background: theme.colors.primary, color: '#fff', border: 'none',
                  padding: '8px 16px', borderRadius: borderRadiusValue(theme.layout.borderRadius), cursor: 'pointer',
                }}>
                  Button
                </button>
                <button style={{
                  background: theme.colors.primaryDark, color: '#fff', border: 'none',
                  padding: '8px 16px', borderRadius: borderRadiusValue(theme.layout.borderRadius), cursor: 'pointer', marginLeft: '8px',
                }}>
                  Hover State
                </button>
              </div>
              <div className={styles.previewFooter} style={{ borderTop: `1px solid ${theme.colors.border}`, background: theme.colors.bgSubtle }}>
                <span style={{ color: theme.colors.success }}>✓ In stock</span>
                <span style={{ color: theme.colors.error, marginLeft: '12px' }}>✕ Out of stock</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
