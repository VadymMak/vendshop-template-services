'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { useState, useRef, useEffect } from 'react';
import styles from './LanguageSwitcher.module.css';

const LOCALE_LABELS: Record<string, string> = {
  en: 'EN',
  uk: 'UA',
  ru: 'RU',
  de: 'DE',
  sk: 'SK',
  cs: 'CS',
  pl: 'PL',
};

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'inline';
  /** Restrict to these locales (e.g. from getActiveLocales() passed by server parent). Falls back to all routing locales. */
  locales?: string[];
}

export default function LanguageSwitcher({ variant = 'dropdown', locales }: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const activeLocales = locales ?? routing.locales;

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const switchLocale = (next: string) => {
    router.replace(pathname, { locale: next });
    setOpen(false);
  };

  if (variant === 'inline') {
    return (
      <div className={styles.inline}>
        {activeLocales.map((loc) => (
          <button
            key={loc}
            type="button"
            className={`${styles.inlineBtn} ${loc === locale ? styles.inlineActive : ''}`}
            onClick={() => switchLocale(loc)}
          >
            {LOCALE_LABELS[loc] ?? loc.toUpperCase()}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.root} ref={ref}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span>{LOCALE_LABELS[locale] ?? locale.toUpperCase()}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <ul className={styles.dropdown} role="listbox">
          {activeLocales.map((loc) => (
            <li key={loc} role="option" aria-selected={loc === locale}>
              <button
                type="button"
                className={`${styles.option} ${loc === locale ? styles.optionActive : ''}`}
                onClick={() => switchLocale(loc)}
              >
                {LOCALE_LABELS[loc] ?? loc.toUpperCase()}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
