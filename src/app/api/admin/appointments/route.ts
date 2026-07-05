import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const STORE_SLUG = process.env.STORE_SLUG ?? '';

function todayStartBratislava(): Date {
  const str = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Bratislava',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date()).trim();
  return new Date(`${str}T00:00:00`);
}

// GET /api/admin/appointments
// ?scope=active|history|all   (default: active)
// ?status=PENDING|CONFIRMED|…|ALL
// ?masterId=<id>
// ?serviceId=<id>
// ?from=YYYY-MM-DD  ?to=YYYY-MM-DD  (date range, inclusive)
// ?date=YYYY-MM-DD  (exact day, legacy compat)
export async function GET(req: NextRequest) {
  const store = await db.store.findUnique({ where: { slug: STORE_SLUG } });
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const scope     = searchParams.get('scope') ?? 'active'; // active | history | all
  const status    = searchParams.get('status');
  const masterId  = searchParams.get('masterId');
  const serviceId = searchParams.get('serviceId');
  const from      = searchParams.get('from');
  const to        = searchParams.get('to');
  const date      = searchParams.get('date'); // legacy single-day filter

  const where: Record<string, unknown> = { storeId: store.id };

  // ── Scope (date boundary) ─────────────────────────────────────────────────
  const todayStart = todayStartBratislava();
  if (scope === 'active') {
    where.date = { gte: todayStart };
  } else if (scope === 'history') {
    where.date = { lt: todayStart };
  }
  // scope=all → no date boundary

  // ── Date range / single day (overrides scope boundary) ───────────────────
  if (date) {
    const d    = new Date(date);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    where.date = { gte: d, lt: next };
  } else if (from || to) {
    const dateFilter: Record<string, Date> = {};
    if (from) dateFilter.gte = new Date(`${from}T00:00:00`);
    if (to)   dateFilter.lte = new Date(`${to}T23:59:59`);
    where.date = dateFilter;
  }

  // ── Status ────────────────────────────────────────────────────────────────
  if (status && status !== 'ALL') {
    where.status = status;
  }

  // ── Master / Service ──────────────────────────────────────────────────────
  if (masterId)  where.masterId  = masterId;
  if (serviceId) where.serviceId = serviceId;

  const orderBy = scope === 'history'
    ? [{ date: 'desc' as const }, { timeSlot: 'asc' as const }]
    : [{ date: 'asc' as const },  { timeSlot: 'asc' as const }];

  const appointments = await db.appointment.findMany({
    where,
    orderBy,
    take: 500,
    include: {
      service: { select: { nameKey: true, price: true } },
      master:  { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(
    appointments.map((a) => ({
      id:             a.id,
      guestName:      a.guestName,
      guestPhone:     a.guestPhone,
      date:           a.date.toISOString(),
      timeSlot:       a.timeSlot,
      duration:       a.duration,
      status:         a.status,
      service:        a.service?.nameKey ?? null,
      servicePrice:   a.service?.price ?? null,
      priceAtBooking: a.priceAtBooking,
      masterId:       a.master?.id ?? null,
      master:         a.master?.name ?? null,
      note:           a.note,
      createdAt:      a.createdAt.toISOString(),
    }))
  );
}
