'use client';
import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AdminLocale } from '@/lib/admin-i18n';
import { getAdminT } from '@/lib/admin-i18n';

const COOKIE_KEY = 'admin_locale';
const VALID: AdminLocale[] = ['sk', 'en', 'cs', 'de', 'uk', 'ru', 'pl'];

type Ctx = {
  locale: AdminLocale;
  changeLocale: (l: AdminLocale) => void;
  t: ReturnType<typeof getAdminT>;
};

const AdminLocaleCtx = createContext<Ctx>({
  locale: 'sk',
  changeLocale: () => {},
  t: getAdminT('sk'),
});

export function AdminLocaleProvider({
  children,
  initial = 'sk',
}: {
  children: ReactNode;
  initial?: AdminLocale;
}) {
  const [locale, setLocale] = useState<AdminLocale>(
    (VALID as string[]).includes(initial) ? initial : 'sk'
  );

  const changeLocale = useCallback((next: AdminLocale) => {
    setLocale(next);
    document.cookie = `${COOKIE_KEY}=${next};path=/;max-age=31536000;SameSite=Lax`;
  }, []);

  return (
    <AdminLocaleCtx.Provider value={{ locale, changeLocale, t: getAdminT(locale) }}>
      {children}
    </AdminLocaleCtx.Provider>
  );
}

export function useAdminT() {
  return useContext(AdminLocaleCtx);
}
