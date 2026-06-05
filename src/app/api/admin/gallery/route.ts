import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyAdminToken, getAdminSecret, ADMIN_COOKIE } from '@/lib/adminAuth';

const STORE_SLUG = process.env.STORE_SLUG ?? 'electromarket';

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  return verifyAdminToken(token, getAdminSecret());
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const store = await db.store.findUniqueOrThrow({ where: { slug: STORE_SLUG } });
  const images = await db.galleryImage.findMany({
    where: { storeId: store.id },
    orderBy: { sortOrder: 'asc' },
  });
  return NextResponse.json({ images });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json() as { url: string; alt?: string };
  if (!body.url) {
    return NextResponse.json({ error: 'URL required' }, { status: 400 });
  }

  const store = await db.store.findUniqueOrThrow({ where: { slug: STORE_SLUG } });

  const maxSort = await db.galleryImage.findFirst({
    where: { storeId: store.id },
    orderBy: { sortOrder: 'desc' },
    select: { sortOrder: true },
  });

  const image = await db.galleryImage.create({
    data: {
      storeId: store.id,
      url: body.url,
      alt: body.alt ?? '',
      sortOrder: (maxSort?.sortOrder ?? -1) + 1,
    },
  });

  return NextResponse.json({ image }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json() as {
    id: string;
    alt?: string;
    sortOrder?: number;
    active?: boolean;
  };

  if (!body.id) {
    return NextResponse.json({ error: 'Image ID required' }, { status: 400 });
  }

  const { id, ...updates } = body;
  const data = Object.fromEntries(
    Object.entries(updates).filter(([, v]) => v !== undefined),
  );

  const image = await db.galleryImage.update({ where: { id }, data });
  return NextResponse.json({ image });
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Image ID required' }, { status: 400 });
  }

  await db.galleryImage.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
