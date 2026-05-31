import type { Metadata } from 'next';
import '../../globals.css';

export const metadata: Metadata = {
  title: 'Admin — ElectroMarket',
  robots: { index: false, follow: false },
};

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
