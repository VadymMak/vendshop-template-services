import { setRequestLocale, getTranslations } from 'next-intl/server';
import CatalogPage, {
  type CatalogProduct,
  type CatalogFacets,
} from '@/components/catalog/CatalogPage/CatalogPage';
import { db } from '@/lib/db';

const STORE_SLUG = process.env.STORE_SLUG ?? 'electromarket';
const PAGE_SIZE = 12;

const BRAND_DISPLAY: Record<string, string> = {
  MAKITA: 'Makita', BOSCH: 'Bosch', DEWALT: 'DeWalt',
  MILWAUKEE: 'Milwaukee', METABO: 'Metabo',
};

export default async function CatalogRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('sampleProducts');
  const store = await db.store.findUniqueOrThrow({ where: { slug: STORE_SLUG } });

  const [dbProducts, total, categoryFacets, brandGroups] = await Promise.all([
    db.product.findMany({
      where: { storeId: store.id },
      orderBy: { reviewCount: 'desc' },
      take: PAGE_SIZE,
    }),
    db.product.count({ where: { storeId: store.id } }),
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
  ]);

  const initialProducts: CatalogProduct[] = dbProducts.map((p) => ({
    id: p.id,
    slug: p.slug,
    brand: p.brand ?? '',
    name: t(p.nameKey),
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

  const facets: CatalogFacets = {
    categories: categoryFacets
      .filter((c) => c._count.products > 0)
      .map((c) => ({ slug: c.slug, count: c._count.products })),
    brands: brandGroups
      .filter((b) => b.brand !== null)
      .sort((a, b) => (b._count?.id ?? 0) - (a._count?.id ?? 0))
      .map((b) => ({
        name: BRAND_DISPLAY[b.brand!.toUpperCase()] ?? b.brand!,
        count: b._count?.id ?? 0,
      })),
  };

  return (
    <CatalogPage
      initialProducts={initialProducts}
      initialTotal={total}
      initialTotalPages={Math.ceil(total / PAGE_SIZE)}
      facets={facets}
    />
  );
}
