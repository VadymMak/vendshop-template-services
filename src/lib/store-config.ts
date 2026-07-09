import { cache } from 'react';
import { db } from '@/lib/db';
import { mergeTheme, type ThemeConfig } from '@/lib/theme';
import { getVerticalConfig, type VerticalConfig } from '@/lib/verticals';

const STORE_SLUG = process.env.STORE_SLUG ?? '';

export type StoreMode = 'PHYSICAL' | 'ONLINE' | 'HYBRID';

/** Parsed working hours from JSON: { mon: {open, close} | null, ... } */
export type DayHours = { open: string; close: string } | null;
export type WorkingHours = Record<string, DayHours>;

export interface WhatsAppLinks {
  booking: string;
  location: string;
  general: string;
}

export interface StorePresence {
  primaryMode: StoreMode;
  hasPhysicalLocation: boolean;
  hasDelivery: boolean;
  hasPickup: boolean;
  address?: string;
  postalCode?: string;
  city?: string;
  openingHours?: WorkingHours;
  phone?: string;
  whatsapp?: string;
  email?: string;
  founderName?: string;
  instagram?: string;
  facebook?: string;
  googleRating?: number;
  mapCoords?: { lat: number; lng: number };
}

export interface StoreConfig {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  ogImageUrl?: string;
  aboutImage?: string | null;
  description?: string | null;
  galleryLayout?: string | null;
  theme: ThemeConfig;
  vertical: VerticalConfig;
  presence: StorePresence;
  whatsappLinks: WhatsAppLinks;
}

function buildWhatsAppLinks(number: string | undefined | null): WhatsAppLinks {
  const num = (number ?? '').replace(/\D/g, '');
  const base = num ? `https://wa.me/${num}` : '#';
  return {
    booking:  num ? base : '#',
    location: num ? base : '#',
    general:  num ? base : '#',
  };
}

function parseOpeningHours(raw: string | null | undefined): WorkingHours | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as WorkingHours;
  } catch {
    return undefined;
  }
}

/** Fetch merged store config (theme + vertical + presence). Server components only.
 *  Wrapped in React cache() — deduplicated across layout + page in the same request. */
export const getStoreConfig = cache(async (): Promise<StoreConfig> => {
  const store = await db.store.findUniqueOrThrow({
    where: { slug: STORE_SLUG },
    select: {
      id: true,
      name: true,
      slug: true,
      vertical: true,
      themeConfig: true,
      primaryMode: true,
      address: true,
      postalCode: true,
      city: true,
      openingHours: true,
      logoUrl: true,
      ogImageUrl: true,
      aboutImage: true,
      description: true,
      galleryLayout: true,
      phone: true,
      whatsappPhone: true,
      email: true,
      founderName: true,
      instagramUrl: true,
      facebook: true,
      googleRating: true,
      mapLat: true,
      mapLng: true,
    },
  });

  const dbTheme = store.themeConfig as Partial<ThemeConfig> | null;
  const theme = mergeTheme(dbTheme);

  const mode = store.primaryMode as StoreMode;
  const whatsappNumber = store.whatsappPhone ?? store.phone;

  const presence: StorePresence = {
    primaryMode: mode,
    hasPhysicalLocation: !!store.address,
    hasDelivery: mode !== 'PHYSICAL',
    hasPickup: mode !== 'ONLINE',
    address: store.address ?? undefined,
    postalCode: store.postalCode ?? undefined,
    city: store.city ?? undefined,
    openingHours: parseOpeningHours(store.openingHours),
    phone: store.phone ?? undefined,
    whatsapp: store.whatsappPhone ?? undefined,
    email: store.email ?? undefined,
    founderName: store.founderName ?? undefined,
    instagram: store.instagramUrl ?? undefined,
    facebook: store.facebook ?? undefined,
    googleRating: store.googleRating ?? undefined,
    mapCoords:
      store.mapLat && store.mapLng
        ? { lat: store.mapLat, lng: store.mapLng }
        : undefined,
  };

  return {
    id: store.id,
    name: store.name,
    slug: store.slug,
    logoUrl: store.logoUrl ?? undefined,
    ogImageUrl: store.ogImageUrl ?? undefined,
    aboutImage: store.aboutImage ?? null,
    description: store.description ?? null,
    galleryLayout: store.galleryLayout ?? null,
    theme,
    vertical: getVerticalConfig(store.vertical),
    presence,
    whatsappLinks: buildWhatsAppLinks(whatsappNumber),
  };
});
