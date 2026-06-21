import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const auth   = req.headers.get('authorization') ?? '';
  const secret = process.env.CRON_SECRET ?? '';
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const todayStr = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Bratislava',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date()).trim();

  const startOfToday = new Date(`${todayStr}T00:00:00`);

  // Mark past PENDING/CONFIRMED as COMPLETED — never delete (needed for salary history)
  const { count } = await db.appointment.updateMany({
    where: {
      date:   { lt: startOfToday },
      status: { in: ['PENDING', 'CONFIRMED'] },
    },
    data: { status: 'COMPLETED' },
  });

  return NextResponse.json({ closed: count, cutoff: todayStr });
}
