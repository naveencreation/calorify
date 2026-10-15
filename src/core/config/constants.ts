export const AI_MODEL_CONFIG = {
  PRIMARY_MODEL: 'gemini-2.5-flash',
  FALLBACK_MODEL: 'gemini-2.0-flash',
  BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models',
} as const;

export const QUOTA_CONFIG = {
  FREE_DAILY_AI_SCANS: 5,
  MAX_REQUESTS_PER_MINUTE: 10,
  MIN_SEND_COOLDOWN_MS: 3000,
} as const;

export const AUTH_SECURITY_CONFIG = {
  RECENT_LOGIN_MAX_AGE_MS: 4 * 60 * 1000,
} as const;
