import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { config } from 'dotenv';
import { DARK_THEME } from '../src/lib/theme';

config({ path: '.env' });
config({ path: '.env.local', override: true });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter } as any);

async function main() {
  const before = await db.store.findFirst({ select: { slug: true, themeConfig: true } });
  console.log('Before:', JSON.stringify(before?.themeConfig, null, 2));

  const result = await db.store.update({
    where: { slug: 'kate-barber' },
    data: { themeConfig: DARK_THEME as any },
    select: { slug: true },
  });
  console.log(`✅ Updated store "${result.slug}" to DARK_THEME`);
}

main().finally(() => db.$disconnect());
