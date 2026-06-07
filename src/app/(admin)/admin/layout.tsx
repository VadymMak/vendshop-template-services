import type { Metadata } from 'next';
import { db } from '@/lib/db';
import '../../globals.css';

const STORE_SLUG = process.env.STORE_SLUG ?? 'electromarket';

export async function generateMetadata(): Promise<Metadata> {
  const store = await db.store.findUnique({
    where: { slug: STORE_SLUG },
    select: { name: true },
  });
  return {
    title: `Admin — ${store?.name ?? 'Store'}`,
    robots: { index: false, follow: false },
  };
}

// Root layout for the whole admin section — its own <html>/<body>, no store
// Header/Footer, no next-intl. The sidebar shell lives in the (panel) group so
// that /admin/login can render without it.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  );
}
