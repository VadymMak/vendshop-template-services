import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { put } from '@vercel/blob';
import { verifyAdminToken, getAdminSecret, ADMIN_COOKIE } from '@/lib/adminAuth';

const STORE_SLUG = process.env.STORE_SLUG ?? 'electromarket';

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
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
  }

  try {
    const blob = await put(
      `gallery/${STORE_SLUG}/${Date.now()}-${file.name}`,
      file,
      { access: 'public', contentType: file.type },
    );

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error('[gallery upload]', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
