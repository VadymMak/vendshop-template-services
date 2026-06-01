import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const STORE_SLUG = process.env.STORE_SLUG ?? 'electromarket';

const BRAND_DISPLAY: Record<string, string> = {
  MAKITA: 'Makita',
  BOSCH: 'Bosch',
  DEWALT: 'DeWalt',
  MILWAUKEE: 'Milwaukee',
  METABO: 'Metabo',
};

// GET /api/products/facets — category + brand counts for filter sidebar
export async function GET() {
  try {
    const store = await db.store.findUniqueOrThrow({ where: { slug: STORE_SLUG } });

    const [categoryFacets, brandGroups, priceAgg] = await Promise.all([
      db.category.findMany({
        where: { storeId: store.id },
        include: { _count: { select: { products: true } } },
        orderBy: { sortOrder: 'asc' },
      }),
      db.product.groupBy({
        by: ['brand'],
        where: { storeId: store.id },
        _count: { id: true },
      }),
      db.product.aggregate({
        where: { storeId: store.id },
        _min: { price: true },
        _max: { price: true },
      }),
    ]);

    const categories = categoryFacets
      .filter((c) => c._count.products > 0)
      .map((c) => ({ slug: c.slug, nameKey: c.nameKey, count: c._count.products }));

    const brands = brandGroups
      .filter((b) => b.brand !== null)
      .sort((a, b) => (b._count?.id ?? 0) - (a._count?.id ?? 0))
      .map((b) => ({
        name: BRAND_DISPLAY[b.brand!.toUpperCase()] ?? b.brand!,
        rawName: b.brand!,
        count: b._count?.id ?? 0,
      }));

    return NextResponse.json({
      categories,
      brands,
      priceRange: {
        min: priceAgg._min.price ?? 0,
        max: priceAgg._max.price ?? 25000,
      },
    });
  } catch (error) {
    console.error('[GET /api/products/facets]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
