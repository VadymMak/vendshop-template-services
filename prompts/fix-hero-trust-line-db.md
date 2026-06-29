# Fix: hero trust line — city, openingHours, instagram from DB

## Что сейчас (hardcoded):
```tsx
// src/components/sections/HeroSection.tsx line 73
⭐ Google 4.9 · 🕐 Po–Pia 09:00–19:00 · 📍 Trenčín · Instagram
```

## Что должно быть (из DB):
- `city` → store.city из DB
- `openingHours` → форматированный JSON из store.openingHours
- `instagram` → store.metadata.instagram из DB

---

## Шаг 1 — Утилита форматирования часов

В файле `src/lib/formatHours.ts` создай:

```ts
type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
type HoursMap = Record<DayKey, { open: string; close: string } | null>;

const DAY_SHORT: Record<DayKey, string> = {
  mon: 'Po', tue: 'Ut', wed: 'St', thu: 'Št', fri: 'Pi', sat: 'So', sun: 'Ne',
};

/**
 * Formats hours map to compact string: "Po–Pi 09:00–18:00"
 * Groups consecutive days with same hours.
 */
export function formatHoursDisplay(hours: unknown): string | null {
  if (!hours || typeof hours !== 'object') return null;
  const map = hours as HoursMap;

  const weekdays: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri'];
  const weekdayHours = weekdays.map(d => map[d]);

  // Check if Mon–Fri all same hours
  const first = weekdayHours[0];
  if (first && weekdayHours.every(h => h?.open === first.open && h?.close === first.close)) {
    return `Po–Pi ${first.open}–${first.close}`;
  }

  // Fallback: just show Mon hours
  if (first) return `Po ${first.open}–${first.close}`;
  return null;
}
```

---

## Шаг 2 — API: сохранение instagram в metadata

В файле `src/app/api/admin/store-info/route.ts`:

**GET** — добавить `metadata: true` в select:
```ts
select: {
  name: true, vertical: true, description: true,
  primaryMode: true, address: true, city: true,
  openingHours: true, logoUrl: true, phone: true,
  email: true, mapLat: true, mapLng: true,
  metadata: true,   // ADD THIS
},
```

И в GET response добавить instagram из metadata:
```ts
const meta = (store?.metadata ?? {}) as Record<string, unknown>;
return NextResponse.json({
  store: {
    ...store,
    instagram: (meta.instagram as string) ?? '',
    facebook:  (meta.facebook  as string) ?? '',
    whatsapp:  (meta.whatsapp  as string) ?? '',
  }
});
```

**PUT** — добавить сохранение social links в metadata:
```ts
// После const data: Record<string, unknown> = {};
// Добавить обработку social links (они НЕ идут в data, а в metadata)
const socialKeys = ['instagram', 'facebook', 'whatsapp'] as const;
const socialUpdate: Record<string, unknown> = {};
for (const key of socialKeys) {
  if (key in body) socialUpdate[key] = body[key] ?? '';
}

// В db.store.update добавить:
const store = await db.store.update({
  where: { slug: STORE_SLUG },
  data: {
    ...data,
    ...(Object.keys(socialUpdate).length > 0 ? {
      metadata: {
        // Merge with existing metadata
        ...((await db.store.findUnique({ where: { slug: STORE_SLUG }, select: { metadata: true } }))?.metadata as object ?? {}),
        ...socialUpdate,
      }
    } : {}),
  },
  select: { name: true, primaryMode: true },
});
```

---

## Шаг 3 — page.tsx: передать данные в HeroSection

```ts
// Добавить импорт
import { formatHoursDisplay } from '@/lib/formatHours';
import { CONTACT } from '@/lib/constants';

// Получить из DB (уже есть store.city, store.openingHours)
// Добавить metadata в select:
select: {
  id: true, address: true, city: true, phone: true,
  email: true, openingHours: true, mapLat: true, mapLng: true,
  metadata: true,   // ADD
},

// После parsedHours, добавить:
const meta = (store?.metadata ?? {}) as Record<string, unknown>;
const instagramUrl = (meta.instagram as string) || CONTACT.instagram;
const cityDisplay = store?.city || CONTACT.city;
const openingHoursText = formatHoursDisplay(parsedHours) ?? 'Po–Pi 09:00–18:00';

// Передать в HeroSection:
<HeroSection
  config={heroConfig}
  city={cityDisplay}
  openingHoursText={openingHoursText}
  instagramUrl={instagramUrl}
/>
```

---

## Шаг 4 — HeroSection.tsx: использовать пропсы

```ts
// Обновить интерфейс:
interface HeroSectionProps {
  config?: HeroConfig | null;
  city?: string;
  openingHoursText?: string;
  instagramUrl?: string;
}

// Деструктурировать:
export default function HeroSection({ config, city, openingHoursText, instagramUrl }: HeroSectionProps) {
  // ...existing code...

  // Обновить trust line (line ~72):
  <p className="hero__trust">
    ⭐ Google 4.9 &nbsp;·&nbsp;
    {openingHoursText && <>🕐 {openingHoursText} &nbsp;·&nbsp;</>}
    {city && <>📍 {city} &nbsp;·&nbsp;</>}
    {instagramUrl && (
      <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="hero__instagram">
        Instagram
      </a>
    )}
  </p>
}
```

---

## Шаг 5 — Проверка

```bash
npx tsc --noEmit
```

Ожидаем: 0 errors.

```bash
git add src/lib/formatHours.ts src/components/sections/HeroSection.tsx \
        src/app/api/admin/store-info/route.ts src/app/(store)/[locale]/page.tsx
git commit -m "feat: hero trust line — city/openingHours/instagram from DB"
git push origin main
git push vendshop-labs main
```
