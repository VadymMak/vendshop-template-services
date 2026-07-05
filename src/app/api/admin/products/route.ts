import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyAdminToken, getAdminSecret, ADMIN_COOKIE } from '@/lib/adminAuth';

const STORE_SLUG = process.env.STORE_SLUG ?? '';

async function checkAdmin(): Promise<boolean> {
  const c = await cookies();
  const token = c.get(ADMIN_COOKIE)?.value;
  return verifyAdminToken(token, getAdminSecret());
}

async function getStore() {
  return db.store.findUnique({ where: { slug: STORE_SLUG }, select: { id: true } });
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const store = await getStore();
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  const products = await db.digitalProduct.findMany({
    where: { storeId: store.id },
    include: { translations: true },
    orderBy: { sortOrder: 'asc' },
  });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const store = await getStore();
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  const body = await request.json() as {
    slug: string;
    price: number;
    currency?: string;
    fileUrl?: string;
    previewUrl?: string;
    sortOrder?: number;
    translations: { locale: string; name: string; description?: string }[];
  };

  if (!body.slug || !body.price || !body.translations?.length) {
    return NextResponse.json({ error: 'slug, price and translations are required' }, { status: 400 });
  }

  const product = await db.digitalProduct.create({
    data: {
      storeId: store.id,
      slug: body.slug.trim(),
      price: body.price,
      currency: body.currency ?? 'EUR',
      fileUrl: body.fileUrl ?? null,
      previewUrl: body.previewUrl ?? null,
      sortOrder: body.sortOrder ?? 0,
      translations: {
        create: body.translations.map((t) => ({
          locale: t.locale,
          name: t.name.trim(),
          description: t.description?.trim() ?? null,
        })),
      },
    },
    include: { translations: true },
  });

  return NextResponse.json(product, { status: 201 });
}
