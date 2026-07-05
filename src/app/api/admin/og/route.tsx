import { NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import { put, del } from '@vercel/blob';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST() {
  const STORE_SLUG = process.env.STORE_SLUG;
  if (!STORE_SLUG) {
    return NextResponse.json({ error: 'STORE_SLUG not configured' }, { status: 500 });
  }

  const store = await db.store.findUnique({
    where: { slug: STORE_SLUG },
    select: { id: true, name: true, city: true, ogImageUrl: true },
  });

  if (!store) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  }

  // Fetch top services for display
  const services = await db.service.findMany({
    where: { storeId: store.id, active: true },
    select: { nameKey: true },
    orderBy: { price: 'asc' },
    take: 4,
  });
  const serviceLabel = services.map((s) => s.nameKey).join('  ·  ');

  const imageResponse = new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #0A0A0A 0%, #161616 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Georgia, serif',
          position: 'relative',
          padding: '60px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: '#C9A347',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: '#C9A347',
            display: 'flex',
          }}
        />
        <h1
          style={{
            fontSize: '80px',
            color: '#FFFFFF',
            margin: '0 0 16px',
            textAlign: 'center',
            letterSpacing: '-1px',
            lineHeight: 1.1,
            display: 'flex',
          }}
        >
          {store.name}
        </h1>
        {store.city ? (
          <p
            style={{
              fontSize: '28px',
              color: '#C9A347',
              margin: '0 0 36px',
              letterSpacing: '6px',
              textTransform: 'uppercase',
              display: 'flex',
            }}
          >
            {store.city}
          </p>
        ) : null}
        {serviceLabel ? (
          <p
            style={{
              fontSize: '22px',
              color: 'rgba(255,255,255,0.45)',
              margin: 0,
              letterSpacing: '2px',
              textAlign: 'center',
              display: 'flex',
            }}
          >
            {serviceLabel}
          </p>
        ) : null}
      </div>
    ),
    { width: 1200, height: 630 }
  );

  const arrayBuffer = await imageResponse.arrayBuffer();

  // Delete old OG image if exists
  if (store.ogImageUrl) {
    try {
      await del(store.ogImageUrl, { token: process.env.BLOB_READ_WRITE_TOKEN! });
    } catch {
      // ignore — old blob may already be deleted
    }
  }

  // Timestamp in filename = unique URL = no social-media cache issues
  const blob = await put(
    `og/${STORE_SLUG}-${Date.now()}.png`,
    Buffer.from(arrayBuffer),
    {
      access: 'public',
      contentType: 'image/png',
      token: process.env.BLOB_READ_WRITE_TOKEN!,
    }
  );

  await db.store.update({
    where: { id: store.id },
    data: { ogImageUrl: blob.url },
  });

  return NextResponse.json({ url: blob.url });
}
