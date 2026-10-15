/**
 * Normalizes a UID segment so it can be safely used in AsyncStorage and SecureStore keys.
 * Replaces non-alphanumeric characters with underscores.
 */
export const sanitizeUidSegment = (uid: string): string => {
  if (!uid || typeof uid !== 'string') return 'anonymous';
  return uid.replace(/[^a-zA-Z0-9_]/g, '_');
};

/**
 * Builds a user-scoped AsyncStorage key:
 * Format: `@calorify_v2_${sanitizeUidSegment(uid)}_${domainKey}`
 */
export const buildUserStorageKey = (uid: string, domainKey: string): string => {
  const safeUid = sanitizeUidSegment(uid);
  return `@calorify_v2_${safeUid}_${domainKey}`;
};

/**
 * Builds a user-scoped hardware-backed SecureStore key:
 * Format: `calorify_v2_gemini_key_${sanitizeUidSegment(uid)}`
 */
export const buildSecureKeyName = (uid: string): string => {
  const safeUid = sanitizeUidSegment(uid);
  return `calorify_v2_gemini_key_${safeUid}`;
};
