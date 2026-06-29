type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
type HoursMap = Record<DayKey, { open: string; close: string } | null>;

const DAY_SHORT: Record<DayKey, string> = {
  mon: 'Po', tue: 'Ut', wed: 'St', thu: 'Št', fri: 'Pi', sat: 'So', sun: 'Ne',
};

void DAY_SHORT; // used for future per-day formatting

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
