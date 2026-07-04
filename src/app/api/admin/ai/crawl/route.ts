import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { db } from '@/lib/db';

export async function GET() {
  const storeSlug = process.env.STORE_SLUG ?? 'kate-barber';
  const store = await db.store.findUnique({ where: { slug: storeSlug } });
  if (!store) return NextResponse.json({ total: 0, breakdown: {}, lastUpdated: null });

  const chunks = await db.$queryRawUnsafe<{ chunkType: string; count: bigint }[]>(
    `SELECT "chunkType", COUNT(*) as count FROM "StoreKnowledge" WHERE "storeId" = $1 GROUP BY "chunkType"`,
    store.id
  );

  const breakdown = Object.fromEntries(chunks.map((c) => [c.chunkType, Number(c.count)]));
  const total = chunks.reduce((s, c) => s + Number(c.count), 0);

  const latest = await db.$queryRawUnsafe<{ createdAt: Date }[]>(
    `SELECT "createdAt" FROM "StoreKnowledge" WHERE "storeId" = $1 ORDER BY "createdAt" DESC LIMIT 1`,
    store.id
  );

  return NextResponse.json({ total, breakdown, lastUpdated: latest[0]?.createdAt ?? null });
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const STORE_SLUG = process.env.STORE_SLUG ?? 'kate-barber';

async function getEmbedding(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return res.data[0].embedding;
}

export async function POST(_req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 });
  }

  const store = await db.store.findUnique({ where: { slug: STORE_SLUG } });
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  await db.$executeRawUnsafe(
    'DELETE FROM "StoreKnowledge" WHERE "storeId" = $1',
    store.id
  );

  const chunks: { type: string; content: string; metadata: object }[] = [];

  // ── Layer 1: DB data ──────────────────────────────────────────────────────

  // About / Store info
  chunks.push({
    type: 'about',
    content: `Barbershop: ${store.name}. ${store.description ?? ''}. Adresa: ${store.address ?? ''}, ${store.city ?? ''}. Telefón: ${store.phone ?? ''}. Email: ${store.email ?? ''}.`,
    metadata: { name: store.name, city: store.city },
  });

  // Working hours
  if (store.openingHours) {
    chunks.push({
      type: 'hours',
      content: `Otváracie hodiny ${store.name}: ${store.openingHours}`,
      metadata: {},
    });
  }

  // Services
  const services = await db.service.findMany({
    where: { storeId: store.id, active: true },
  });
  for (const s of services) {
    chunks.push({
      type: 'service',
      content: `Služba: ${s.nameKey}. Cena: €${s.price}${s.duration ? `, trvanie: ${s.duration} min` : ''}${s.description ? `. Popis: ${s.description}` : ''}.`,
      metadata: { price: s.price, duration: s.duration },
    });
  }

  // Masters
  const masters = await db.serviceMaster.findMany({
    where: { storeId: store.id, active: true },
  });
  for (const m of masters) {
    chunks.push({
      type: 'master',
      content: `Majster: ${m.name}, rola: ${m.role}${m.bio ? `. ${m.bio}` : ''}.`,
      metadata: { name: m.name, role: m.role },
    });
  }

  // Reviews summary
  const reviews = await db.testimonial.findMany({
    where: { storeId: store.id, status: 'APPROVED' },
    include: { customer: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  if (reviews.length > 0) {
    const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
    chunks.push({
      type: 'review',
      content: `Hodnotenie ${store.name}: ${avgRating}/5 na základe ${reviews.length} recenzií. Posledné recenzie: ${reviews.slice(0, 5).map((r) => `"${r.text}" — ${r.customer?.name ?? 'Zákazník'} (${r.rating}⭐)`).join('; ')}.`,
      metadata: { avgRating, totalReviews: reviews.length },
    });
  }

  const dbChunksCount = chunks.length;

  // ── Layer 2: Web pages crawl ──────────────────────────────────────────────

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const pagesToCrawl = [
    { path: '/sk', label: 'Hlavná stránka' },
    { path: '/sk/testimonials', label: 'Recenzie stránka' },
    { path: '/sk/products', label: 'Produkty stránka' },
  ];

  for (const page of pagesToCrawl) {
    try {
      const res = await fetch(`${baseUrl}${page.path}`, {
        headers: { 'User-Agent': 'StoreRAGCrawler/1.0' },
        cache: 'no-store',
      });
      if (!res.ok) continue;

      const html = await res.text();
      const text = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 3000);

      if (text.length < 100) continue;

      chunks.push({
        type: 'webpage',
        content: `Obsah stránky "${page.label}" (${page.path}):\n${text}`,
        metadata: { url: page.path, label: page.label },
      });
    } catch (err) {
      console.warn(`[crawl] Failed to fetch ${page.path}:`, err);
    }
  }

  const webChunksCount = chunks.length - dbChunksCount;

  // ── Save all chunks with embeddings ──────────────────────────────────────

  let saved = 0;
  for (const chunk of chunks) {
    const embedding = await getEmbedding(chunk.content);
    const vectorStr = `[${embedding.join(',')}]`;
    await db.$executeRawUnsafe(
      `INSERT INTO "StoreKnowledge" (id, "storeId", "chunkType", content, embedding, metadata, "createdAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4::vector, $5::jsonb, now())`,
      store.id,
      chunk.type,
      chunk.content,
      vectorStr,
      JSON.stringify(chunk.metadata)
    );
    saved++;
  }

  return NextResponse.json({
    ok: true,
    chunksIndexed: saved,
    breakdown: { db: dbChunksCount, web: webChunksCount },
  });
}
