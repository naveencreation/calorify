let counter = 0;

/**
 * Generates collision-safe, deterministic-format entity identifiers.
 * Format: `${prefix}_${timestamp}_${randomHex}`
 */
export const generateEntityId = (prefix: string): string => {
  const timestamp = Date.now();
  counter = (counter + 1) % 10000;
  const counterHex = counter.toString(16).padStart(4, '0');
  const randomHex = Math.random().toString(16).substring(2, 8);
  return `${prefix}_${timestamp}_${counterHex}${randomHex}`;
};
