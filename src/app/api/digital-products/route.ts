import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const STORE_SLUG = process.env.STORE_SLUG ?? 'kate-barber';
const FALLBACK_LOCALE = 'sk';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get('locale') ?? FALLBACK_LOCALE;
  const storeSlug = searchParams.get('storeSlug') ?? STORE_SLUG;

  const store = await db.store.findUnique({
    where: { slug: storeSlug },
    select: { id: true },
  });
  if (!store) return NextResponse.json([]);

  const products = await db.digitalProduct.findMany({
    where: { storeId: store.id, active: true },
    include: {
      translations: {
        where: { locale: { in: [locale, FALLBACK_LOCALE] } },
      },
    },
    orderBy: { sortOrder: 'asc' },
  });

  const result = products.map((p) => {
    const t =
      p.translations.find((tr) => tr.locale === locale) ??
      p.translations.find((tr) => tr.locale === FALLBACK_LOCALE);
    return {
      id: p.id,
      slug: p.slug,
      price: p.price,
      currency: p.currency,
      previewUrl: p.previewUrl,
      fileUrl: p.fileUrl,
      name: t?.name ?? p.slug,
      description: t?.description ?? null,
    };
  });

  return NextResponse.json(result);
}
