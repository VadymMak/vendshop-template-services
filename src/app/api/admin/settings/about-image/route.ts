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

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const processed = await sharp(buffer)
      .resize(1200, 900, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const filename = `about-${Date.now()}.webp`;
    const blob = await put(`about/${filename}`, processed, {
      access: 'public',
      contentType: 'image/webp',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    await db.store.update({
      where: { slug: STORE_SLUG },
      data: { aboutImage: blob.url },
    });

    revalidatePath('/');
    revalidatePath('/de');
    revalidatePath('/en');
    revalidatePath('/sk');

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error('[about-image/upload]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const store = await db.store.findUnique({
      where: { slug: STORE_SLUG },
      select: { aboutImage: true },
    });
    if (store?.aboutImage) {
      try { await del(store.aboutImage); } catch { /* blob may already be gone */ }
    }
    await db.store.update({
      where: { slug: STORE_SLUG },
      data: { aboutImage: null },
    });
    revalidatePath('/');
    revalidatePath('/de');
    revalidatePath('/en');
    revalidatePath('/sk');
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[about-image/delete]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
