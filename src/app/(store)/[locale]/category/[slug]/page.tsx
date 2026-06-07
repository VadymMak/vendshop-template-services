import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import CategoryPage from '@/components/category/CategoryPage/CategoryPage';
import type { CatalogProduct } from '@/components/catalog/CatalogPage/CatalogPage';
import type { CategoryId } from '@/components/home/CategoriesGrid/CategoriesGrid';
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
  const baseUrl = getBaseUrl();
  const store = await db.store.findUnique({ where: { slug: STORE_SLUG } });
  if (!store) return {};
  const category = await db.category.findFirst({ where: { storeId: store.id, slug } });
  if (!category) return {};
  const t = await getTranslations({ locale, namespace: 'sampleProducts' });
  const name = t.has(category.nameKey) ? t(category.nameKey) : category.nameKey;

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = `${baseUrl}/${loc}/category/${slug}`;
  }

  return {
    title: name,
    description: `${name} — ${store.name}`,
    alternates: {
      canonical: `${baseUrl}/${locale}/category/${slug}`,
      languages,
    },
    openGraph: {
      type: 'website',
      title: name,
      description: `${name} — ${store.name}`,
      url: `${baseUrl}/${locale}/category/${slug}`,
      siteName: store.name,
    },
  };
}

export default async function CategoryRoute({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const store = await db.store.findUniqueOrThrow({ where: { slug: STORE_SLUG } });
  const category = await db.category.findFirst({ where: { storeId: store.id, slug } });
  if (!category) notFound();

  const t = await getTranslations('sampleProducts');

  const dbProducts = await db.product.findMany({
    where: { storeId: store.id, categoryId: category.id },
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

  return <CategoryPage slug={slug as CategoryId} products={products} />;
}
