import { db } from '@/lib/db';
import AdminProductsClient from './AdminProductsClient';

const STORE_SLUG = process.env.STORE_SLUG ?? 'electromarket';

export default async function AdminProductsPage() {
  const store = await db.store.findUnique({
    where: { slug: STORE_SLUG },
    select: { id: true, vertical: true },
  });

  if (!store) {
    return <p style={{ padding: '2rem' }}>Магазин «{STORE_SLUG}» не знайдено</p>;
  }

  const [products, categories] = await Promise.all([
    db.product.findMany({
      where: { storeId: store.id },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    }),
    db.category.findMany({
      where: { storeId: store.id },
      orderBy: { sortOrder: 'asc' },
    }),
  ]);

  const serializedProducts = products.map((p) => {
    const meta = (p.metadata ?? {}) as Record<string, unknown>;
    return {
      id: p.id,
      name: p.nameKey,
      slug: p.slug,
      sku: (meta.sku as string) ?? '',
      categorySlug: p.category?.slug ?? '',
      categoryId: p.categoryId ?? '',
      brand: p.brand ?? '',
      price: p.price,
      oldPrice: p.oldPrice ?? undefined,
      currency: p.currency,
      inStock: p.inStock,
      image: p.image ?? '/placeholder-product.svg',
      isHit: p.isHit,
      isNew: p.isNew,
      dietaryTags: (meta.dietaryTags as string[]) ?? [],
      allergens: (meta.allergens as string) ?? '',
      portion: (meta.portion as string) ?? '',
      prepTime: (meta.prepTime as number) ?? 0,
      weight: (meta.weight as string) ?? '',
      expiryDays: (meta.expiryDays as number) ?? 0,
      temperature: (meta.temperature as string) ?? 'room',
      calories: (meta.calories as number) ?? 0,
      organic: (meta.organic as boolean) ?? false,
    };
  });

  const serializedCategories = categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    label: c.nameKey,
  }));

  return (
    <AdminProductsClient
      vertical={store.vertical}
      initialProducts={serializedProducts}
      categories={serializedCategories}
    />
  );
}
