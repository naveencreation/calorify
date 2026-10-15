/**
 * Recursively strips undefined fields from objects and arrays for Firestore compatibility,
 * while preserving null, primitives, Dates, and array elements.
 */
export const sanitizeForFirestore = <T>(value: T): T => {
  if (value === undefined) {
    return undefined as unknown as T;
  }

  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (value instanceof Date) {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item)) as unknown as T;
  }

  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (val !== undefined) {
      result[key] = sanitizeForFirestore(val);
    }
  }

  return result as T;
};
