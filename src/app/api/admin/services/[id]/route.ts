import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyAdminToken, getAdminSecret, ADMIN_COOKIE } from '@/lib/adminAuth';

async function checkAdmin(): Promise<boolean> {
  const c = await cookies();
  const token = c.get(ADMIN_COOKIE)?.value;
  return verifyAdminToken(token, getAdminSecret());
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const body = await req.json() as Partial<{
    nameKey: string;
    description: string | null;
    price: number;
    duration: number;
    category: string | null;
    active: boolean;
  }>;

  try {
    const data: Record<string, unknown> = {};
    if (body.nameKey !== undefined) data.nameKey = body.nameKey.trim();
    if (body.description !== undefined) data.description = body.description?.trim() || null;
    if (body.price !== undefined) data.price = Number(body.price);
    if (body.duration !== undefined) data.duration = Number(body.duration);
    if (body.category !== undefined) data.category = body.category?.trim() || null;
    if (body.active !== undefined) data.active = body.active;

    const updated = await db.service.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await db.service.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 });
  }
}
