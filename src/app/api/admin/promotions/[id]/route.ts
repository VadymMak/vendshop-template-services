import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json() as Partial<{
      title: string;
      type: string;
      discountPercent: number | null;
      description: string | null;
      startsAt: string;
      endsAt: string | null;
      active: boolean;
    }>;
    const updated = await db.promotion.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.type !== undefined && { type: body.type as never }),
        ...(body.discountPercent !== undefined && { discountPercent: body.discountPercent }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.startsAt !== undefined && { startsAt: new Date(body.startsAt) }),
        ...(body.endsAt !== undefined && { endsAt: body.endsAt ? new Date(body.endsAt) : null }),
        ...(body.active !== undefined && { active: body.active }),
      },
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error('[promotions PUT]', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.promotion.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[promotions DELETE]', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
