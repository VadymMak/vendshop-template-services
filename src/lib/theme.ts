export interface ThemeConfig {
  colors: {
    bg:            string;
    primary:       string;
    primaryDark:   string;
    primaryLight:  string;
    text:          string;
    textSecondary: string;
    textMuted:     string;
    border:        string;
    bgSubtle:      string;
    success:       string;
    error:         string;
    contrast:      string;
    overlay:       string;
    overlayAlpha:  string;
    headerBg:      string;
    bgDark:        string;
    warning:       string;
    successLight:  string;
    errorLight:    string;
    infoLight:     string;
    surface?:      string;
    bgAlt?:        string;
    bgCard?:       string;
  };
  layout: {
    heroType:     'full-width' | 'split' | 'minimal';
    cardStyle:    'shadow' | 'border' | 'flat';
    navPosition:  'top' | 'side';
    borderRadius: 'sharp' | 'rounded' | 'pill';
  };
}

export const DEFAULT_THEME: ThemeConfig = {
  colors: {
    bg:            '#ffffff',
    primary:       '#f97316',
    primaryDark:   '#ea6c00',
    primaryLight:  '#fff7ed',
    text:          '#1a1a1a',
    textSecondary: '#9ca3af',
    textMuted:     '#6b7280',
    border:        '#e5e7eb',
    bgSubtle:      '#f1f5f9',
    success:       '#16a34a',
    error:         '#ef4444',
    contrast:      '#ffffff',
    overlay:       '#000000',
    overlayAlpha:  'rgba(0,0,0,0.6)',
    headerBg:      'rgba(0,0,0,0.9)',
    bgDark:        '#1e293b',
    warning:       '#fbbf24',
    successLight:  '#dcfce7',
    errorLight:    '#fef2f2',
    infoLight:     '#eff6ff',
    surface:       '#ffffff',
    bgAlt:         '#f8fafc',
    bgCard:        '#ffffff',
  },
  layout: {
    heroType:     'full-width',
    cardStyle:    'shadow',
    navPosition:  'top',
    borderRadius: 'rounded',
  },
};

export const DARK_THEME: ThemeConfig = {
  colors: {
    bg:            '#0A0A0A',
    primary:       '#C96030',
    primaryDark:   '#A84E25',
    primaryLight:  '#E07848',
    text:          '#FFFFFF',
    textSecondary: '#B0A898',
    textMuted:     '#666666',
    border:        'rgba(201, 96, 48, 0.15)',
    bgSubtle:      '#111111',
    success:       '#16a34a',
    error:         '#ef4444',
    contrast:      '#FFFFFF',
    overlay:       '#000000',
    overlayAlpha:  'rgba(0,0,0,0.6)',
    headerBg:      'rgba(10, 10, 10, 0.95)',
    bgDark:        '#0A0A0A',
    warning:       '#fbbf24',
    successLight:  '#dcfce7',
    errorLight:    '#fef2f2',
    infoLight:     '#eff6ff',
    surface:       '#1a1a1a',
    bgAlt:         '#111111',
    bgCard:        '#161616',
  },
  layout: {
    heroType:     'split',
    cardStyle:    'border',
    navPosition:  'top',
    borderRadius: 'sharp',
  },
};

export const NAVY_THEME: ThemeConfig = {
  colors: {
    bg:            '#060E18',
    primary:       '#C9A347',
    primaryDark:   '#A8893E',
    primaryLight:  '#E0B85A',
    text:          '#FFFFFF',
    textSecondary: '#B8C4D4',
    textMuted:     '#506478',
    border:        'rgba(201, 163, 71, 0.18)',
    bgSubtle:      '#0A1828',
    success:       '#4ade80',
    error:         '#ef4444',
    contrast:      '#FFFFFF',
    overlay:       '#000000',
    overlayAlpha:  'rgba(0, 0, 0, 0.65)',
    headerBg:      'rgba(6, 14, 24, 0.95)',
    bgDark:        '#020D14',
    warning:       '#fbbf24',
    successLight:  '#dcfce7',
    errorLight:    '#fef2f2',
    infoLight:     '#eff6ff',
    surface:       '#0A1828',
    bgAlt:         '#0A1828',
    bgCard:        '#0E2040',
  },
  layout: {
    heroType:     'split',
    cardStyle:    'border',
    navPosition:  'top',
    borderRadius: 'sharp',
  },
};

/** Merge a partial DB theme over DEFAULT_THEME, deriving surface/bgAlt/bgCard from the preset's bg when not specified. */
export function mergeTheme(dbTheme: Partial<ThemeConfig> | null): ThemeConfig {
  const mergedColors = { ...DEFAULT_THEME.colors, ...(dbTheme?.colors ?? {}) };
  const dbColors = dbTheme?.colors;
  if (dbColors?.bg) {
    const fallback = dbColors.bgSubtle ?? mergedColors.bgSubtle;
    if (dbColors.surface === undefined) mergedColors.surface = fallback;
    if (dbColors.bgAlt   === undefined) mergedColors.bgAlt   = fallback;
    if (dbColors.bgCard  === undefined) mergedColors.bgCard  = fallback;
  }
  return {
    colors: mergedColors,
    layout: { ...DEFAULT_THEME.layout, ...(dbTheme?.layout ?? {}) },
  };
}

export function themeToCssVars(theme: ThemeConfig): Record<string, string> {
  const radiusMap = {
    sharp:   { xs: '2px',    sm: '3px',    md: '4px',    lg: '6px',    xl: '8px'    },
    rounded: { xs: '4px',    sm: '6px',    md: '8px',    lg: '12px',   xl: '16px'   },
    pill:    { xs: '9999px', sm: '9999px', md: '9999px', lg: '9999px', xl: '9999px' },
  };

  const cardMap = {
    shadow: {
      shadow:      '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)',
      shadowHover: '0 12px 28px rgba(17,24,39,0.12)',
      border:      '1px solid transparent',
    },
    border: {
      shadow:      'none',
      shadowHover: 'none',
      border:      '1px solid var(--color-border)',
    },
    flat: {
      shadow:      'none',
      shadowHover: 'none',
      border:      'none',
    },
  };

  const radius = radiusMap[theme.layout.borderRadius];
  const card   = cardMap[theme.layout.cardStyle];

  return {
    // Colors
    '--color-bg':             theme.colors.bg,
    '--color-primary':        theme.colors.primary,
    '--color-primary-dark':   theme.colors.primaryDark,
    '--color-primary-light':  theme.colors.primaryLight,
    '--color-text':           theme.colors.text,
    '--color-text-secondary': theme.colors.textSecondary,
    '--color-text-muted':     theme.colors.textMuted,
    '--color-border':         theme.colors.border,
    '--color-bg-subtle':      theme.colors.bgSubtle,
    '--color-success':        theme.colors.success,
    '--color-error':          theme.colors.error,
    '--color-contrast':       theme.colors.contrast,
    '--color-overlay':        theme.colors.overlay,
    '--color-overlay-alpha':  theme.colors.overlayAlpha,
    '--color-header-bg':      theme.colors.headerBg,
    '--color-bg-dark':        theme.colors.bgDark,
    '--color-warning':        theme.colors.warning,
    '--color-success-light':  theme.colors.successLight,
    '--color-error-light':    theme.colors.errorLight,
    '--color-info-light':     theme.colors.infoLight,
    '--color-surface':        theme.colors.surface  ?? theme.colors.bgSubtle,
    '--color-bg-alt':         theme.colors.bgAlt    ?? theme.colors.bgSubtle,
    '--color-bg-card':        theme.colors.bgCard   ?? theme.colors.bg,
    // Border radius
    '--radius-xs': radius.xs,
    '--radius-sm': radius.sm,
    '--radius-md': radius.md,
    '--radius-lg': radius.lg,
    '--radius-xl': radius.xl,
    // Card style
    '--card-shadow':       card.shadow,
    '--card-shadow-hover': card.shadowHover,
    '--card-border':       card.border,
  };
}
