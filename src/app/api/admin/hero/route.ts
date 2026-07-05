import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyAdminToken, getAdminSecret, ADMIN_COOKIE } from '@/lib/adminAuth';

const STORE_SLUG = process.env.STORE_SLUG ?? '';

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
  if (!store) return NextResponse.json(null);

  const config = await db.heroConfig.findUnique({ where: { storeId: store.id } });
  return NextResponse.json(config);
}

export async function PATCH(req: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const store = await db.store.findUnique({ where: { slug: STORE_SLUG } });
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  const body = await req.json() as Partial<{
    title: string;
    subtitle: string;
    ctaText: string;
    imageUrl: string | null;
  }>;

  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title.trim();
  if (body.subtitle !== undefined) data.subtitle = body.subtitle.trim();
  if (body.ctaText !== undefined) data.ctaText = body.ctaText.trim();
  if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl?.trim() || null;

  const config = await db.heroConfig.upsert({
    where: { storeId: store.id },
    create: {
      storeId: store.id,
      title: (data.title as string) ?? '',
      subtitle: (data.subtitle as string) ?? '',
      ctaText: (data.ctaText as string) ?? 'Rezervovať termín',
      imageUrl: (data.imageUrl as string | null) ?? null,
    },
    update: data,
  });

  return NextResponse.json(config);
}
