import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import CategoryPage from '@/components/category/CategoryPage/CategoryPage';
import type { CatalogProduct } from '@/components/catalog/CatalogPage/CatalogPage';
import type { CategoryId } from '@/components/home/CategoriesGrid/CategoriesGrid';
import { db } from '@/lib/db';

export const revalidate = 60;

const STORE_SLUG = process.env.STORE_SLUG ?? 'electromarket';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const store = await db.store.findUnique({ where: { slug: STORE_SLUG } });
  if (!store) return {};
  const category = await db.category.findFirst({ where: { storeId: store.id, slug } });
  if (!category) return {};
  const tc = await getTranslations({ locale, namespace: 'categories' });
  return { title: tc(category.nameKey) };
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
