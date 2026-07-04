/**
 * Canonical store data fix.
 * Run: npx tsx scripts/fix-store-data.ts
 *
 * Decisions made:
 *  Phone:      +421 900 111 222   (single canonical number)
 *  WhatsApp:   +421 900 111 222   (same — separate field so WhatsApp deep-links work)
 *  Address:    Mierové námestie 10, 911 01 Trenčín
 *  Founder:    Kate Novák
 *  Positioning: barber pre mužov  (beard/hair services = men's)
 *  Admin reply language: SK
 */
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // ── 1. Canonical store fields ───────────────────────────────────────────
  const store = await prisma.store.update({
    where: { slug: 'kate-barber' },
    data: {
      phone:        '+421 900 111 222',
      whatsappPhone: '+421 900 111 222',
      address:      'Mierové námestie 10',
      postalCode:   '911 01',
      city:         'Trenčín',
      email:        'info@katebarber.sk',
      founderName:  'Kate Novák',
      instagramUrl: 'https://instagram.com/kate.barber.trencin',
      googleRating: 4.9,
      openingHours: JSON.stringify({
        mon: { open: '09:00', close: '18:00' },
        tue: { open: '09:00', close: '18:00' },
        wed: { open: '09:00', close: '18:00' },
        thu: { open: '09:00', close: '18:00' },
        fri: { open: '09:00', close: '18:00' },
        sat: { open: '09:00', close: '14:00' },
        sun: null,
      }),
    },
  });
  console.log(`✅ Store updated: ${store.name} — ${store.phone} — ${store.address}`);

  // ── 2. HeroConfig — fix subtitle positioning ────────────────────────────
  const hero = await prisma.heroConfig.findUnique({ where: { storeId: store.id } });
  if (hero) {
    await prisma.heroConfig.update({
      where: { storeId: store.id },
      data: { subtitle: 'Prémiový barber pre mužov.' },
    });
    console.log('✅ HeroConfig subtitle updated');
  } else {
    await prisma.heroConfig.create({
      data: {
        storeId:  store.id,
        subtitle: 'Prémiový barber pre mužov.',
      },
    });
    console.log('✅ HeroConfig created');
  }

  // ── 3. Fix English admin replies → Slovak ──────────────────────────────
  const englishReplies = await prisma.testimonial.findMany({
    where: {
      storeId:    store.id,
      adminReply: { not: null },
    },
    select: { id: true, adminReply: true },
  });

  const SK_REPLY_MAP: Record<string, string> = {
    'Thank you for your kind words, Maria! We appreciate your feedback.':
      'Ďakujeme za tvoje slová, Maria! Teší nás, že si spokojná s naším štúdiom.',
    'Thanks':
      'Ďakujeme!',
    'Thank you!':
      'Ďakujeme!',
  };

  let fixedReplies = 0;
  for (const t of englishReplies) {
    const reply = t.adminReply ?? '';
    // Check if the reply is in English (contains non-Slovak English words)
    const isEnglish = /\bThank\b|\bWe appreciate\b|\bkind words\b/i.test(reply);
    if (isEnglish) {
      const fixed = SK_REPLY_MAP[reply] ??
        'Ďakujeme za tvoju spätnú väzbu! Teší nás, že si spokojný/á.';
      await prisma.testimonial.update({
        where: { id: t.id },
        data: { adminReply: fixed },
      });
      fixedReplies++;
      console.log(`✅ Fixed reply [${t.id.slice(-6)}]: "${reply}" → "${fixed}"`);
    }
  }
  if (fixedReplies === 0) console.log('ℹ️  No English admin replies found');

  console.log('\n✅ All canonical data applied.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
