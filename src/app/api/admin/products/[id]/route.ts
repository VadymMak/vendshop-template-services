import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyAdminToken, getAdminSecret, ADMIN_COOKIE } from '@/lib/adminAuth';

async function checkAdmin(): Promise<boolean> {
  const c = await cookies();
  const token = c.get(ADMIN_COOKIE)?.value;
  return verifyAdminToken(token, getAdminSecret());
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;

  const body = await request.json() as {
    slug?: string;
    price?: number;
    currency?: string;
    fileUrl?: string | null;
    previewUrl?: string | null;
    active?: boolean;
    sortOrder?: number;
    translations?: { locale: string; name: string; description?: string }[];
  };

  const data: Record<string, unknown> = {};
  if (body.slug !== undefined) data.slug = body.slug.trim();
  if (body.price !== undefined) data.price = body.price;
  if (body.currency !== undefined) data.currency = body.currency;
  if (body.fileUrl !== undefined) data.fileUrl = body.fileUrl;
  if (body.previewUrl !== undefined) data.previewUrl = body.previewUrl;
  if (body.active !== undefined) data.active = body.active;
  if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder;

  const product = await db.digitalProduct.update({ where: { id }, data });

  if (body.translations?.length) {
    for (const t of body.translations) {
      await db.digitalProductTranslation.upsert({
        where: { productId_locale: { productId: id, locale: t.locale } },
        update: { name: t.name.trim(), description: t.description?.trim() ?? null },
        create: { productId: id, locale: t.locale, name: t.name.trim(), description: t.description?.trim() ?? null },
      });
    }
  }

  const updated = await db.digitalProduct.findUnique({
    where: { id },
    include: { translations: true },
  });

  return NextResponse.json(updated ?? product);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  await db.digitalProduct.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
