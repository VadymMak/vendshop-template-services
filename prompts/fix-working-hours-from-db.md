# Fix: working hours from DB in DateTimePicker + HeroSection trust line

## Проблема
DateTimePicker — хардкод:
- Воскресенье = нет слотов (dayOfWeek === 0)
- Суббота до 14:00 (dayOfWeek === 6 ? 14 : 18)
- Остальные до 18:00

Все должно браться из DB: store.openingHours (JSON формат HoursMap)

## Шаг 1 — Обновить DateTimePicker.tsx

Файл: `src/components/ui/DateTimePicker.tsx`

**Тип HoursMap** — добавить в начало файла (перед компонентом):
```ts
type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type HoursMap = Record<DayKey, { open: string; close: string } | null>;

const DAY_KEY: Record<number, DayKey> = {
  0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat',
};
```

**Обновить generateTimeSlots** — заменить целиком:
```ts
function generateTimeSlots(dayOfWeek: number, workingHours?: HoursMap): string[] {
  const dayKey = DAY_KEY[dayOfWeek];
  
  if (workingHours) {
    const hours = workingHours[dayKey];
    if (!hours) return []; // day closed
    const [startH, startM] = hours.open.split(':').map(Number);
    const [endH,   endM]   = hours.close.split(':').map(Number);
    const slots: string[] = [];
    let h = startH, m = startM;
    while (h < endH || (h === endH && m <= endM)) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      m += 30;
      if (m >= 60) { m = 0; h++; }
    }
    return slots;
  }

  // Fallback if no workingHours passed (keep old logic)
  if (dayOfWeek === 0) return [];
  const endHour = dayOfWeek === 6 ? 14 : 18;
  const endMin  = dayOfWeek === 6 ? 30 : 0;
  const slots: string[] = [];
  let h = 9, m = 0;
  while (true) {
    const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    slots.push(time);
    if (h === endHour && m === endMin) break;
    m += 30;
    if (m >= 60) { m = 0; h++; }
  }
  return slots;
}
```

**Обновить props интерфейс**:
```ts
interface DateTimePickerProps {
  onSelect: (date: string, time: string) => void;
  onDayChange?: (date: string) => void;
  bookedSlots?: string[];
  loading?: boolean;
  workingHours?: HoursMap;  // ADD THIS
}
```

**Обновить деструктуризацию и вызов generateTimeSlots**:
```ts
export default function DateTimePicker({
  onSelect,
  onDayChange,
  bookedSlots = [],
  loading = false,
  workingHours,  // ADD
}: DateTimePickerProps) {
  // ...existing state...

  // Update this line to pass workingHours:
  const timeSlots = generateTimeSlots(selectedDay.getDay(), workingHours);
```

---

## Шаг 2 — Обновить BookingSection.tsx

Файл: `src/components/sections/BookingSection.tsx`

**Добавить prop workingHours**:
```ts
import type { HoursMap } from '@/components/ui/DateTimePicker';

interface BookingSectionProps {
  workingHours?: HoursMap;
}

export default function BookingSection({ workingHours }: BookingSectionProps) {
```

**Передать workingHours в DateTimePicker** (найди компонент DateTimePicker в JSX и добавь):
```tsx
<DateTimePicker
  onSelect={handleDateTimeSelect}
  onDayChange={handleDayChange}
  bookedSlots={bookedSlots}
  loading={loadingSlots}
  workingHours={workingHours}  // ADD
/>
```

---

## Шаг 3 — Обновить page.tsx

Файл: `src/app/(store)/[locale]/page.tsx`

Передать parsedHours в BookingSection:
```tsx
// Найти строку:
<BookingSection />

// Заменить на:
<BookingSection workingHours={parsedHours as HoursMap | undefined} />
```

Добавить импорт типа вверху файла:
```ts
import type { HoursMap } from '@/components/ui/DateTimePicker';
```

---

## Шаг 4 — Утилита форматирования для HeroSection trust line

Создать файл `src/lib/formatHours.ts`:

```ts
type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type HoursMap = Record<DayKey, { open: string; close: string } | null>;

const DAY_SHORT: Record<DayKey, string> = {
  mon: 'Po', tue: 'Ut', wed: 'St', thu: 'Št', fri: 'Pi', sat: 'So', sun: 'Ne',
};

/**
 * Returns compact display string, e.g.:
 * "Po–Pi 09:00–19:00 · So 09:00–14:00"
 */
export function formatHoursDisplay(hours: unknown): string | null {
  if (!hours || typeof hours !== 'object') return null;
  const map = hours as HoursMap;

  const weekdays: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri'];
  const weekend:  DayKey[] = ['sat', 'sun'];

  const parts: string[] = [];

  // Group weekdays
  const wdHours = weekdays.map(d => map[d]);
  const firstWd = wdHours[0];
  if (firstWd && wdHours.every(h => h?.open === firstWd.open && h?.close === firstWd.close)) {
    parts.push(`Po–Pi ${firstWd.open}–${firstWd.close}`);
  } else {
    // Show each open weekday separately
    weekdays.forEach(d => {
      const h = map[d];
      if (h) parts.push(`${DAY_SHORT[d]} ${h.open}–${h.close}`);
    });
  }

  // Weekend
  weekend.forEach(d => {
    const h = map[d];
    if (h) parts.push(`${DAY_SHORT[d]} ${h.open}–${h.close}`);
  });

  return parts.length > 0 ? parts.join(' · ') : null;
}
```

---

## Шаг 5 — Обновить HeroSection.tsx для trust line

Файл: `src/components/sections/HeroSection.tsx`

Добавить импорты:
```ts
import { formatHoursDisplay } from '@/lib/formatHours';
import { CONTACT } from '@/lib/constants';
```

Обновить props:
```ts
interface HeroSectionProps {
  config?: HeroConfig | null;
  city?: string;
  workingHours?: unknown;  // raw HoursMap from DB
  instagramUrl?: string;
}
```

Использовать в компоненте:
```tsx
export default function HeroSection({ config, city, workingHours, instagramUrl }: HeroSectionProps) {
  const hoursText = formatHoursDisplay(workingHours);
  const cityText  = city || CONTACT.city;
  const igUrl     = instagramUrl || CONTACT.instagram;
  
  // ...existing code...

  // Trust line (~line 72):
  <p className="hero__trust">
    ⭐ Google 4.9
    {hoursText && <>&nbsp;·&nbsp; 🕐 {hoursText}</>}
    {cityText  && <>&nbsp;·&nbsp; 📍 {cityText}</>}
    {igUrl && (
      <>&nbsp;·&nbsp;{' '}
        <a href={igUrl} target="_blank" rel="noopener noreferrer" className="hero__instagram">
          Instagram
        </a>
      </>
    )}
  </p>
```

---

## Шаг 6 — Обновить page.tsx для HeroSection

```tsx
// Добавить импорты:
import { CONTACT } from '@/lib/constants';

// Добавить в DB select:
metadata: true,

// После parsedHours:
const meta = (store?.metadata ?? {}) as Record<string, unknown>;
const instagramUrl = (meta.instagram as string) || CONTACT.instagram;

// Обновить HeroSection:
<HeroSection
  config={heroConfig}
  city={store?.city ?? undefined}
  workingHours={parsedHours ?? undefined}
  instagramUrl={instagramUrl}
/>
```

---

## Шаг 7 — Проверка

```bash
npx tsc --noEmit
```

Ожидаем: 0 errors.

```bash
git add src/components/ui/DateTimePicker.tsx \
        src/components/sections/BookingSection.tsx \
        src/components/sections/HeroSection.tsx \
        src/app/(store)/[locale]/page.tsx \
        src/lib/formatHours.ts
git commit -m "feat: working hours from DB in DateTimePicker + hero trust line"
git push origin main
git push vendshop-labs main
```
