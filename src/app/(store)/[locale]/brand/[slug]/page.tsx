import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import BrandPage from '@/components/brand/BrandPage/BrandPage';
import type { CatalogProduct } from '@/components/catalog/CatalogPage/CatalogPage';
import { BRANDS, isBrandSlug } from '@/data/products';
import { db } from '@/lib/db';
import { getBaseUrl } from '@/lib/url';
import { routing } from '@/i18n/routing';

export const revalidate = 60;

const STORE_SLUG = process.env.STORE_SLUG ?? 'electromarket';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isBrandSlug(slug)) return {};
  const brand = BRANDS[slug];
  const baseUrl = getBaseUrl();
  const store = await db.store.findUnique({ where: { slug: STORE_SLUG } });

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = `${baseUrl}/${loc}/brand/${slug}`;
  }

  return {
    title: brand.name,
    description: store ? `${brand.name} — ${store.name}` : brand.name,
    alternates: {
      canonical: `${baseUrl}/${locale}/brand/${slug}`,
      languages,
    },
    openGraph: {
      type: 'website',
      title: brand.name,
      description: store ? `${brand.name} — ${store.name}` : brand.name,
      url: `${baseUrl}/${locale}/brand/${slug}`,
      siteName: store?.name,
    },
  };
}

export default async function BrandRoute({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  if (!isBrandSlug(slug)) notFound();
  const brand = BRANDS[slug];

  const t = await getTranslations('sampleProducts');
  const store = await db.store.findUniqueOrThrow({ where: { slug: STORE_SLUG } });

  const dbProducts = await db.product.findMany({
    where: {
      storeId: store.id,
      brand: { equals: brand.wordmark, mode: 'insensitive' },
    },
    orderBy: { reviewCount: 'desc' },
  });

  const products: CatalogProduct[] = dbProducts.map((p) => ({
    id: p.id,
    slug: p.slug,
    brand: p.brand ?? '',
    name: t.has(p.nameKey) ? t(p.nameKey) : p.nameKey,
    image: p.image ?? '/placeholder-product.svg',
    price: p.price,
    oldPrice: p.oldPrice ?? undefined,
    currency: p.currency,
    rating: p.rating,
    reviewCount: p.reviewCount,
    inStock: p.inStock,
    isHit: p.isHit,
    isNew: p.isNew,
  }));

  return <BrandPage wordmark={brand.wordmark} color={brand.color} products={products} />;
}
