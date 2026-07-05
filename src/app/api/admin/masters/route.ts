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
  if (!store) return NextResponse.json([]);

  const masters = await db.serviceMaster.findMany({
    where: { storeId: store.id },
    orderBy: { sortOrder: 'asc' },
  });

  return NextResponse.json(masters);
}

export async function POST(req: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const store = await db.store.findUnique({ where: { slug: STORE_SLUG } });
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  const body = await req.json() as {
    name: string;
    role: string;
    bio?: string;
    photo?: string;
    active?: boolean;
  };

  if (!body.name?.trim() || !body.role?.trim()) {
    return NextResponse.json({ error: 'Name and role are required' }, { status: 400 });
  }

  const maxSort = await db.serviceMaster.findFirst({
    where: { storeId: store.id },
    orderBy: { sortOrder: 'desc' },
    select: { sortOrder: true },
  });

  const master = await db.serviceMaster.create({
    data: {
      storeId: store.id,
      name: body.name.trim(),
      role: body.role.trim(),
      bio: body.bio?.trim() || null,
      photo: body.photo?.trim() || null,
      active: body.active ?? true,
      sortOrder: (maxSort?.sortOrder ?? -1) + 1,
    },
  });

  return NextResponse.json(master, { status: 201 });
}
