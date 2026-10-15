export const pad2 = (n: number): string => String(n).padStart(2, '0');

/**
 * Returns YYYY-MM-DD for a given Date object in the local timezone.
 */
export const getLocalDateKey = (date: Date = new Date()): string => {
  const y = date.getFullYear();
  const m = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  return `${y}-${m}-${d}`;
};

/**
 * Parses YYYY-MM-DD into a local Date object.
 */
export const parseLocalDate = (dateKey: string): Date => {
  if (!dateKey || typeof dateKey !== 'string') return new Date();
  const parts = dateKey.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return new Date(y, m, d);
    }
  }
  return new Date();
};

/**
 * Returns start-of-day and end-of-day ISO strings in local timezone for a YYYY-MM-DD key.
 */
export const getDateStartAndEndIso = (
  dateKey: string
): { startIso: string; endIso: string } => {
  const d = parseLocalDate(dateKey);
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
};

/**
 * Generates an array of past date keys (YYYY-MM-DD) ending at fromDate in chronological order.
 */
export const getPastDateKeys = (days: number, fromDate?: Date): string[] => {
  if (days <= 0) return [];
  const base = fromDate ? new Date(fromDate.getTime()) : new Date();
  const result: string[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const target = new Date(base.getFullYear(), base.getMonth(), base.getDate() - i);
    result.push(getLocalDateKey(target));
  }

  return result;
};

/**
 * Checks if targetDateKey is strictly in the future relative to todayKey.
 */
export const isFutureDateKey = (
  dateKey: string,
  todayKey: string = getLocalDateKey()
): boolean => {
  if (!dateKey) return false;
  return dateKey > todayKey;
};
