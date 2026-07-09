import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreConfig } from '@/lib/store-config';

export async function GET() {
  try {
    const config = await getStoreConfig();
    const promos = await db.promotion.findMany({
      where: { storeId: config.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        type: true,
        discountPercent: true,
        description: true,
        startsAt: true,
        endsAt: true,
        active: true,
      },
    });
    return NextResponse.json(promos);
  } catch (err) {
    console.error('[promotions GET]', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const config = await getStoreConfig();
    const body = await req.json() as {
      title: string;
      type: string;
      discountPercent?: number | null;
      description?: string | null;
      startsAt: string;
      endsAt?: string | null;
    };
    const promo = await db.promotion.create({
      data: {
        storeId: config.id,
        title: body.title,
        type: body.type as never,
        discountPercent: body.discountPercent ?? null,
        description: body.description ?? null,
        startsAt: new Date(body.startsAt),
        endsAt: body.endsAt ? new Date(body.endsAt) : null,
        active: true,
      },
    });
    return NextResponse.json(promo, { status: 201 });
  } catch (err) {
    console.error('[promotions POST]', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
