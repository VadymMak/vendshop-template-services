import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { mergeTheme, DEFAULT_THEME, type ThemeConfig } from '@/lib/theme';

const STORE_SLUG = process.env.STORE_SLUG ?? 'electromarket';

export async function GET() {
  const store = await db.store.findUnique({
    where: { slug: STORE_SLUG },
    select: { themeConfig: true },
  });

  const dbTheme = store?.themeConfig as Partial<ThemeConfig> | null;
  const theme = mergeTheme(dbTheme);

  return Response.json(theme);
}

export async function PUT(req: NextRequest) {
  const body = (await req.json()) as Partial<ThemeConfig>;

  const store = await db.store.findUniqueOrThrow({
    where: { slug: STORE_SLUG },
    select: { id: true, themeConfig: true },
  });

  const currentTheme = store.themeConfig as Partial<ThemeConfig> | null;
  const base = mergeTheme(currentTheme);

  const updatedTheme: ThemeConfig = {
    colors: { ...base.colors, ...(body.colors ?? {}) },
    layout: { ...base.layout, ...(body.layout ?? {}) },
  };

  await db.store.update({
    where: { id: store.id },
    data: { themeConfig: updatedTheme as object },
  });

  revalidatePath('/', 'layout');
  return Response.json({ success: true, theme: updatedTheme });
}
