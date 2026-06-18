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
  const store = await prisma.store.upsert({
    where: { slug: 'kate-barber' },
    create: {
      name: 'Kate Barber Studio',
      slug: 'kate-barber',
      vertical: 'SERVICES',
      primaryMode: 'PHYSICAL',
      address: 'Palackého 12',
      city: 'Trenčín',
      phone: '+421900123456',
      email: 'info@katebarber.sk',
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
    update: { vertical: 'SERVICES' },
  });

  console.log(`Store: ${store.name} (${store.id})`);

  // Masters
  const masterData = [
    { name: 'Kate',   role: 'Senior Barber', photo: '/team/team-kate.webp',   sortOrder: 0 },
    { name: 'Lucia',  role: 'Hair Stylist',  photo: '/team/team-lucia.webp',  sortOrder: 1 },
    { name: 'Martin', role: 'Beard Master',  photo: '/team/team-martin.webp', sortOrder: 2 },
  ];

  for (const m of masterData) {
    await prisma.serviceMaster.upsert({
      where: { id: `master-${m.name.toLowerCase()}-${store.id}` },
      create: { id: `master-${m.name.toLowerCase()}-${store.id}`, storeId: store.id, ...m },
      update: m,
    });
  }
  console.log('Masters seeded');

  // Services
  const serviceData = [
    { slug: 'haircut',    nameKey: 'services.haircut',   price: 15, duration: 45, category: 'Hair'    },
    { slug: 'beard-trim', nameKey: 'services.beard',     price: 10, duration: 30, category: 'Beard'   },
    { slug: 'hair-beard', nameKey: 'services.hairBeard', price: 22, duration: 60, category: 'Hair'    },
    { slug: 'styling',    nameKey: 'services.styling',   price: 12, duration: 30, category: 'Styling' },
  ];

  for (const s of serviceData) {
    await prisma.service.upsert({
      where: { storeId_slug: { storeId: store.id, slug: s.slug } },
      create: { storeId: store.id, ...s },
      update: s,
    });
  }
  console.log('Services seeded');

  // AdminUser
  const bcrypt = await import('bcryptjs');
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@kate-barber.sk';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'KateBarber2026!';
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    create: { email: adminEmail, passwordHash, name: 'Admin', storeId: store.id },
    update: { passwordHash, storeId: store.id },
  });
  console.log('AdminUser seeded');

  console.log('Done!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
