import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { put } from '@vercel/blob';
import { verifyAdminToken, getAdminSecret, ADMIN_COOKIE } from '@/lib/adminAuth';
import {
  processImageVariants,
  validateImageFile,
  GALLERY_VARIANTS,
  PRODUCT_VARIANTS,
  type ImageVariant,
} from '@/lib/image-utils';

const STORE_SLUG = process.env.STORE_SLUG ?? 'electromarket';

const PURPOSE_VARIANTS: Record<string, ImageVariant[]> = {
  gallery: GALLERY_VARIANTS,
  product: PRODUCT_VARIANTS,
};

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!(await verifyAdminToken(token, getAdminSecret()))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'Image storage not configured. Add BLOB_READ_WRITE_TOKEN to .env.' },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const purpose = (formData.get('purpose') as string) ?? 'gallery';

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const validationError = validateImageFile(file);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const variants = PURPOSE_VARIANTS[purpose] ?? GALLERY_VARIANTS;

  try {
    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const processed = await processImageVariants(inputBuffer, variants);

    const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const timestamp = Date.now();

    const urls: Record<string, string> = {};

    for (const { suffix, processed: img } of processed) {
      const blobPath = `${purpose}/${STORE_SLUG}/${timestamp}-${baseName}${suffix}.webp`;
      const blob = await put(blobPath, img.buffer, {
        access: 'public',
        contentType: img.contentType,
      });
      urls[suffix] = blob.url;
    }

    return NextResponse.json({
      urls,
      url: urls[variants[0].suffix],
      thumbnailUrl: urls[variants.at(-1)!.suffix],
    });
  } catch (error) {
    console.error('[admin upload]', error);
    return NextResponse.json({ error: 'Upload processing failed' }, { status: 500 });
  }
}
