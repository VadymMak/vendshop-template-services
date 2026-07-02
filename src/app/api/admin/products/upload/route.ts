import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { cookies } from 'next/headers';
import { verifyAdminToken, getAdminSecret, ADMIN_COOKIE } from '@/lib/adminAuth';
import sharp from 'sharp';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'application/pdf'];
const MAX_BYTES = 20 * 1024 * 1024;
const STORE_SLUG = process.env.STORE_SLUG ?? 'kate-barber';

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
  const purpose = (formData.get('purpose') as string) ?? 'preview';

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Nepodporovaný formát súboru' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Súbor je príliš veľký (max. 20MB)' }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer() as ArrayBuffer);
    const timestamp = Date.now();
    const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let uploadBuffer: any = buffer;
    let contentType = file.type;
    let ext = file.name.split('.').pop() ?? 'bin';

    if (file.type.startsWith('image/') && purpose === 'preview') {
      uploadBuffer = await sharp(buffer)
        .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
      contentType = 'image/webp';
      ext = 'webp';
    }

    const blob = await put(
      `products/${STORE_SLUG}/${purpose}/${timestamp}-${baseName}.${ext}`,
      uploadBuffer,
      { access: 'public', contentType, token: process.env.BLOB_READ_WRITE_TOKEN },
    );

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error('[products/upload]', error);
    return NextResponse.json({
      error: 'Upload failed',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
