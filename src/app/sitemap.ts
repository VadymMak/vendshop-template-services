import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { db } from '@/lib/db';
import { getBaseUrl } from '@/lib/url';

const STORE_SLUG = process.env.STORE_SLUG ?? 'electromarket';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const store = await db.store.findUnique({ where: { slug: STORE_SLUG } });
  if (!store) return [];

  const entries: MetadataRoute.Sitemap = [];

  const staticPaths = ['', '/catalog', '/cart', '/favorites', '/compare'];

  for (const locale of routing.locales) {
    for (const path of staticPaths) {
      entries.push({
        url: `${baseUrl}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: path === '' ? 'daily' : 'weekly',
        priority: path === '' ? 1.0 : 0.7,
      });
    }
  }

  const products = await db.product.findMany({
    where: { storeId: store.id, inStock: true },
    select: { slug: true, updatedAt: true },
  });

  for (const locale of routing.locales) {
    for (const product of products) {
      entries.push({
        url: `${baseUrl}/${locale}/product/${product.slug}`,
        lastModified: product.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }

  const categories = await db.category.findMany({
    where: { storeId: store.id },
    select: { slug: true },
  });

  for (const locale of routing.locales) {
    for (const cat of categories) {
      entries.push({
        url: `${baseUrl}/${locale}/category/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }
  }

  const brands = await db.product.findMany({
    where: { storeId: store.id, brand: { not: null } },
    select: { brand: true },
    distinct: ['brand'],
  });

  for (const locale of routing.locales) {
    for (const b of brands) {
      if (!b.brand) continue;
      entries.push({
        url: `${baseUrl}/${locale}/brand/${b.brand.toLowerCase()}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.5,
      });
    }
  }

  return entries;
}
