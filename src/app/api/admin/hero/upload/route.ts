import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { cookies } from 'next/headers';
import { verifyAdminToken, getAdminSecret, ADMIN_COOKIE } from '@/lib/adminAuth';
import sharp from 'sharp';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const MAX_BYTES = 10 * 1024 * 1024;

async function checkAdmin(): Promise<boolean> {
  const c = await cookies();
  const token = c.get(ADMIN_COOKIE)?.value;
  return verifyAdminToken(token, getAdminSecret());
}

export async function POST(req: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Nepodporovaný formát. Použite JPEG, PNG, WebP, GIF alebo AVIF.' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Súbor je príliš veľký (max. 10MB)' }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    const processed = await sharp(buffer)
      .resize(1920, 1080, { fit: 'cover', position: 'center' })
      .webp({ quality: 85 })
      .toBuffer();

    const STORE_SLUG = process.env.STORE_SLUG ?? 'kate-barber';
    const filename = `hero-${Date.now()}.webp`;

    const blob = await put(`hero/${STORE_SLUG}/${filename}`, processed, {
      access: 'public',
      contentType: 'image/webp',
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error('[hero/upload]', error);
    return NextResponse.json({
      error: 'Upload processing failed',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
