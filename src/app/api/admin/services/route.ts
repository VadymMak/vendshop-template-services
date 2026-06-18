import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyAdminToken, getAdminSecret, ADMIN_COOKIE } from '@/lib/adminAuth';

const STORE_SLUG = process.env.STORE_SLUG ?? 'kate-barber';

async function checkAdmin(): Promise<boolean> {
  const c = await cookies();
  const token = c.get(ADMIN_COOKIE)?.value;
  return verifyAdminToken(token, getAdminSecret());
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const store = await db.store.findUnique({ where: { slug: STORE_SLUG } });
  if (!store) return NextResponse.json([]);

  const services = await db.service.findMany({
    where: { storeId: store.id },
    orderBy: [{ category: 'asc' }, { price: 'asc' }],
  });

  return NextResponse.json(services);
}

export async function POST(req: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const store = await db.store.findUnique({ where: { slug: STORE_SLUG } });
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  const body = await req.json() as {
    nameKey: string;
    description?: string;
    price: number;
    duration?: number;
    category?: string;
  };

  if (!body.nameKey?.trim()) {
    return NextResponse.json({ error: 'Názov je povinný' }, { status: 400 });
  }

  // Generate unique slug from nameKey
  const baseSlug = body.nameKey
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 60);

  let slug = baseSlug;
  let attempt = 0;
  while (await db.service.findUnique({ where: { storeId_slug: { storeId: store.id, slug } } })) {
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  const service = await db.service.create({
    data: {
      storeId: store.id,
      slug,
      nameKey: body.nameKey.trim(),
      description: body.description?.trim() || null,
      price: Number(body.price),
      duration: Number(body.duration ?? 30),
      category: body.category?.trim() || null,
      active: true,
    },
  });

  return NextResponse.json(service, { status: 201 });
}
