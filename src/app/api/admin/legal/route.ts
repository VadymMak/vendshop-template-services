import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyAdminToken, getAdminSecret, ADMIN_COOKIE } from '@/lib/adminAuth';

const STORE_SLUG = process.env.STORE_SLUG ?? 'kate-barber';

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  return verifyAdminToken(token, getAdminSecret());
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const store = await db.store.findUnique({ where: { slug: STORE_SLUG } });
  if (!store) return NextResponse.json({ config: null });

  const config = await db.legalConfig.findUnique({ where: { storeId: store.id } });
  return NextResponse.json({ config });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json() as {
    enabled?: boolean;
    companyName?: string;
    street?: string;
    zip?: string;
    city?: string;
    country?: string;
    email?: string;
    phone?: string;
    vatId?: string;
  };

  const store = await db.store.findUnique({ where: { slug: STORE_SLUG } });
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  const config = await db.legalConfig.upsert({
    where: { storeId: store.id },
    create: { storeId: store.id, ...body },
    update: body,
  });

  return NextResponse.json({ config });
}
