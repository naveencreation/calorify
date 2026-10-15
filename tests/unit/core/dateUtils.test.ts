import {
  getLocalDateKey,
  parseLocalDate,
  getDateStartAndEndIso,
  getPastDateKeys,
  isFutureDateKey,
} from '@core/utils/dateUtils';
import { generateEntityId } from '@core/utils/idGenerator';

describe('Date & Identifier Core Utilities', () => {
  describe('getLocalDateKey', () => {
    it('formats a date into YYYY-MM-DD pattern', () => {
      const fixedDate = new Date(2026, 9, 14, 12, 0, 0); // Oct 14, 2026
      const key = getLocalDateKey(fixedDate);
      expect(key).toBe('2026-10-14');
    });

    it('zero-pads single-digit month and day', () => {
      const singleDigitDate = new Date(2026, 0, 5, 10, 0, 0); // Jan 5, 2026
      const key = getLocalDateKey(singleDigitDate);
      expect(key).toBe('2026-01-05');
    });
  });

  describe('parseLocalDate', () => {
    it('accurately parses a YYYY-MM-DD string into a local Date', () => {
      const parsed = parseLocalDate('2026-10-14');
      expect(parsed.getFullYear()).toBe(2026);
      expect(parsed.getMonth()).toBe(9); // 0-indexed October
      expect(parsed.getDate()).toBe(14);
    });

    it('returns a fallback valid Date for invalid string format', () => {
      const fallback = parseLocalDate('invalid-date');
      expect(fallback instanceof Date).toBe(true);
      expect(!isNaN(fallback.getTime())).toBe(true);
    });
  });

  describe('getDateStartAndEndIso', () => {
    it('returns ISO strings covering the entire day', () => {
      const { startIso, endIso } = getDateStartAndEndIso('2026-10-14');
      const start = new Date(startIso);
      const end = new Date(endIso);

      expect(start.getHours()).toBe(0);
      expect(start.getMinutes()).toBe(0);
      expect(start.getSeconds()).toBe(0);
      expect(start.getMilliseconds()).toBe(0);

      expect(end.getHours()).toBe(23);
      expect(end.getMinutes()).toBe(59);
      expect(end.getSeconds()).toBe(59);
      expect(end.getMilliseconds()).toBe(999);

      expect(end.getTime()).toBeGreaterThan(start.getTime());
    });
  });

  describe('getPastDateKeys', () => {
    it('returns requested number of past date keys ending at fromDate', () => {
      const baseDate = new Date(2026, 9, 14); // 2026-10-14
      const keys = getPastDateKeys(7, baseDate);

      expect(keys.length).toBe(7);
      expect(keys[0]).toBe('2026-10-08');
      expect(keys[6]).toBe('2026-10-14');
    });

    it('returns empty array when days <= 0', () => {
      expect(getPastDateKeys(0)).toEqual([]);
      expect(getPastDateKeys(-3)).toEqual([]);
    });
  });

  describe('isFutureDateKey', () => {
    it('identifies future dates relative to today', () => {
      const today = '2026-10-14';
      expect(isFutureDateKey('2026-10-15', today)).toBe(true);
      expect(isFutureDateKey('2026-10-14', today)).toBe(false);
      expect(isFutureDateKey('2026-10-13', today)).toBe(false);
    });
  });

  describe('generateEntityId', () => {
    it('generates IDs with the specified prefix and deterministic structure', () => {
      const mealId = generateEntityId('meal');
      const foodId = generateEntityId('custom_food');

      expect(mealId).toMatch(/^meal_\d+_[0-9a-fA-F]+$/);
      expect(foodId).toMatch(/^custom_food_\d+_[0-9a-fA-F]+$/);
    });

    it('generates unique IDs on rapid successive invocations', () => {
      const id1 = generateEntityId('test');
      const id2 = generateEntityId('test');
      const id3 = generateEntityId('test');

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });
  });
});
