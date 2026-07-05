import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import { routing, type Locale } from '@/i18n/routing';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import CookieBanner from '@/components/ui/CookieBanner/CookieBanner';
import { getStoreConfig } from '@/lib/store-config';
import { themeToCssVars, DEFAULT_THEME } from '@/lib/theme';
import { db } from '@/lib/db';
import { VerticalProvider } from '@/lib/vertical-context';
import { PresenceProvider } from '@/lib/presence-context';
import { CustomerProvider } from '@/lib/useCustomer';
import { getBaseUrl } from '@/lib/url';
import '../../globals.css';

const playfair = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-dm-sans',
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);

  const config = await getStoreConfig();
  const baseUrl = getBaseUrl();
  const tSeo = await getTranslations('seo');

  const seoDescription = tSeo('description', { city: config.presence.city ?? '' });
  const ogLocale = tSeo('ogLocale');
  const alternateLocale = routing.locales
    .filter((l) => l !== locale)
    .map((l) => {
      const localeMap: Record<string, string> = {
        en: 'en_US',
        uk: 'uk_UA',
        ru: 'ru_RU',
        de: 'de_DE',
        sk: 'sk_SK',
        cs: 'cs_CZ',
        pl: 'pl_PL',
      };
      return localeMap[l] ?? l;
    });

  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = `${baseUrl}/${l}`;
  }

  return {
    title: {
      default: config.name,
      template: `%s | ${config.name}`,
    },
    description: seoDescription,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages,
    },
    openGraph: {
      type: 'website',
      siteName: config.name,
      title: config.name,
      description: seoDescription,
      url: `${baseUrl}/${locale}`,
      locale: ogLocale,
      alternateLocale,
      images: [
        { url: '/og-image.jpg', width: 1200, height: 630, alt: config.name },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: config.name,
      description: seoDescription,
      images: ['/og-image.jpg'],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
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
  const cssVars = themeToCssVars(config.theme ?? DEFAULT_THEME);
  const baseUrl = getBaseUrl();
  const tSeo = await getTranslations('seo');
  const seoDescription = tSeo('description', { city: config.presence.city ?? '' });

  const storeSlug = process.env.STORE_SLUG ?? 'kate-barber';
  const store = locale === 'de'
    ? await db.store.findUnique({ where: { slug: storeSlug } })
    : null;
  const legalConfig = store
    ? await db.legalConfig.findUnique({ where: { storeId: store.id } })
    : null;
  const legalEnabled = legalConfig?.enabled ?? false;

  const addressCountry = locale === 'de' ? 'DE' : 'SK';
  const jsonLdRaw: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'HairSalon',
    name: config.name,
    description: seoDescription,
    url: `${baseUrl}/${locale}`,
    telephone: config.presence.phone,
    ...(config.presence.address
      ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress: config.presence.address,
            addressLocality: config.presence.city,
            postalCode: config.presence.postalCode,
            addressCountry,
          },
        }
      : {}),
    ...(config.presence.mapCoords
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: config.presence.mapCoords.lat,
            longitude: config.presence.mapCoords.lng,
          },
        }
      : {}),
    ...(config.presence.googleRating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: config.presence.googleRating,
            bestRating: 5,
            ratingCount: 100,
          },
        }
      : {}),
  };

  return (
    <html lang={locale} data-vertical={config.vertical.vertical} className={`${playfair.variable} ${dmSans.variable}`}>
      <head>
        <link rel="preconnect" href="https://conuflmgcnkfqjmncsth.public.blob.vercel-storage.com" />
        <link rel="dns-prefetch" href="https://conuflmgcnkfqjmncsth.public.blob.vercel-storage.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdRaw) }}
        />
      </head>
      <body style={cssVars as React.CSSProperties}>
        <NextIntlClientProvider messages={messages}>
          <CustomerProvider>
            <VerticalProvider config={config.vertical}>
              <PresenceProvider presence={config.presence}>
                <Header logoUrl={config.logoUrl} whatsappBookingLink={config.whatsappLinks.booking} />
                <main>{children}</main>
                <Footer config={config} locale={locale} legalEnabled={legalEnabled} />
                <CookieBanner />
              </PresenceProvider>
            </VerticalProvider>
          </CustomerProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
