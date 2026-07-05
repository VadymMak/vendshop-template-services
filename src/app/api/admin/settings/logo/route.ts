import { put, del } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import sharp from 'sharp';
import { db } from '@/lib/db';

const STORE_SLUG = process.env.STORE_SLUG ?? '';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Resize to 400×120 with transparent background → WebP
    const processed = await sharp(buffer)
      .resize(400, 120, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 90 })
      .toBuffer();

    const filename = `logo-${Date.now()}.webp`;
    const blob = await put(`logos/${filename}`, processed, {
      access: 'public',
      contentType: 'image/webp',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    await db.store.update({
      where: { slug: STORE_SLUG },
      data: { logoUrl: blob.url },
    });

    revalidatePath('/sk');

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error('[logo/upload]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const store = await db.store.findUnique({
      where: { slug: STORE_SLUG },
      select: { logoUrl: true },
    });
    if (store?.logoUrl) {
      try { await del(store.logoUrl); } catch { /* blob may already be gone */ }
    }
    await db.store.update({ where: { slug: STORE_SLUG }, data: { logoUrl: null } });
    revalidatePath('/sk');
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[logo/delete]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
