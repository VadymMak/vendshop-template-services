import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import { getStoreConfig } from '@/lib/store-config';
import { themeToCssVars } from '@/lib/theme';
import { VerticalProvider } from '@/lib/vertical-context';
import '../../globals.css';

export const metadata: Metadata = {
  title: 'ElectroMarket',
  description: 'Universal e-commerce template for VendShop',
};

// Re-check DB every 60 seconds (ISR)
export const revalidate = 60;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const config = await getStoreConfig();
  const cssVars = themeToCssVars(config.theme);

  return (
    <html lang={locale} data-vertical={config.vertical.vertical}>
      <body style={cssVars as React.CSSProperties}>
        <NextIntlClientProvider messages={messages}>
          <VerticalProvider config={config.vertical}>
            <Header />
            <main>{children}</main>
            <Footer />
          </VerticalProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
