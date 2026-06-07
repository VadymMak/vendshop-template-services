import type { Metadata } from 'next';
import { db } from '@/lib/db';
import LoginForm from '@/components/admin/LoginForm/LoginForm';

const STORE_SLUG = process.env.STORE_SLUG ?? 'electromarket';

export async function generateMetadata(): Promise<Metadata> {
  const store = await db.store.findUnique({
    where: { slug: STORE_SLUG },
    select: { name: true },
  });
  return {
    title: `Вхід — Admin ${store?.name ?? 'Store'}`,
    robots: { index: false, follow: false },
  };
}

// Standalone login page — root admin layout only (no sidebar shell).
export default async function AdminLoginPage() {
  const store = await db.store.findUnique({
    where: { slug: STORE_SLUG },
    select: { name: true, vertical: true },
  });
  return <LoginForm storeName={store?.name ?? 'Store'} vertical={store?.vertical ?? 'ECOMMERCE'} />;
}
