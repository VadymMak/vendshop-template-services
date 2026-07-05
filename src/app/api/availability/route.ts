import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { BUSINESS_START, BUSINESS_END, SLOT_INTERVAL } from '@/lib/constants';
import { getStoreSlug } from '@/lib/store-slug';
import type { TimeSlot } from '@/lib/types';

function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function generateSlots(startMin: number, endMin: number, intervalMin: number): string[] {
  const slots: string[] = [];
  for (let t = startMin; t < endMin; t += intervalMin) {
    const h = Math.floor(t / 60).toString().padStart(2, '0');
    const m = (t % 60).toString().padStart(2, '0');
    slots.push(`${h}:${m}`);
  }
  return slots;
}

// GET /api/availability?masterId=xxx&date=YYYY-MM-DD&serviceId=xxx
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const masterId  = searchParams.get('masterId');
  const dateStr   = searchParams.get('date');
  const serviceId = searchParams.get('serviceId');

  if (!dateStr) {
    return NextResponse.json({ error: 'date required' }, { status: 400 });
  }

  // Bratislava "today" and "now" for past-time guard
  const todayBratislava = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Bratislava',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date()).trim();

  const nowHHMM = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Bratislava',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(new Date()).trim();

  const allSlots = generateSlots(parseTime(BUSINESS_START), parseTime(BUSINESS_END), SLOT_INTERVAL);

  // Load service duration
  let duration = SLOT_INTERVAL;
  if (serviceId) {
    const service = await db.service.findUnique({ where: { id: serviceId } });
    if (service) duration = service.duration;
  }

  // Past date → all unavailable
  if (dateStr < todayBratislava) {
    return NextResponse.json({
      slots: allSlots.map((time) => ({ time, available: false })),
      duration,
    });
  }

  // Load booked appointments for the day
  const date     = new Date(dateStr);
  const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
  const dayEnd   = new Date(date); dayEnd.setHours(23, 59, 59, 999);

  const bookedWhere: Record<string, unknown> = {
    date:   { gte: dayStart, lte: dayEnd },
    status: { notIn: ['CANCELLED'] },
  };
  if (masterId) bookedWhere.masterId = masterId;

  // Scope to this store's appointments only
  try {
    const storeSlug = getStoreSlug();
    const store = await db.store.findUnique({
      where: { slug: storeSlug },
      select: { id: true },
    });
    if (store) bookedWhere.storeId = store.id;
  } catch {
    // STORE_SLUG not set — skip scoping (dev fallback)
  }

  const booked = await db.appointment.findMany({
    where: bookedWhere,
    select: { timeSlot: true, duration: true },
  });

  const bookedSet = new Set(booked.map((a) => a.timeSlot));
  const isToday   = dateStr === todayBratislava;

  const result: TimeSlot[] = allSlots.map((time) => ({
    time,
    available: !bookedSet.has(time) && !(isToday && time <= nowHHMM),
  }));

  return NextResponse.json({ slots: result, duration });
}
