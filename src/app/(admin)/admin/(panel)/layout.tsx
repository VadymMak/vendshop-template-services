import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import AdminSidebar from '@/components/admin/AdminSidebar/AdminSidebar';
import { AdminLocaleProvider } from '@/lib/admin-locale-ctx';
import type { AdminLocale } from '@/lib/admin-i18n';
import styles from './admin.module.css';

const STORE_SLUG = process.env.STORE_SLUG ?? 'electromarket';

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const store = await db.store.findUnique({
    where: { slug: STORE_SLUG },
    select: { name: true, vertical: true },
  });

  const cookieStore = await cookies();
  const initialLocale = (cookieStore.get('admin_locale')?.value ?? 'sk') as AdminLocale;

  return (
    <AdminLocaleProvider initial={initialLocale}>
      <div className={styles.shell}>
        <AdminSidebar
          storeName={store?.name ?? 'Store'}
          vertical={store?.vertical ?? 'ECOMMERCE'}
        />
        <main className={styles.content}>{children}</main>
      </div>
    </AdminLocaleProvider>
  );
}
