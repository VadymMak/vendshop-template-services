import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreSlug } from '@/lib/store-slug';

export async function GET() {
  try {
    const STORE_SLUG = getStoreSlug();
    const store = await db.store.findUnique({ where: { slug: STORE_SLUG } });
    if (!store) return NextResponse.json({ services: [] });

    const services = await db.service.findMany({
      where: { storeId: store.id, active: true },
      orderBy: [{ category: 'asc' }, { price: 'asc' }],
      select: {
        id: true,
        slug: true,
        nameKey: true,
        description: true,
        price: true,
        duration: true,
        image: true,
        category: true,
      },
    });

    return NextResponse.json({ services });
  } catch {
    return NextResponse.json({ services: [] });
  }
}
