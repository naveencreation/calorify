import { mapToAppError } from '@core/errors/errorMapper';
import { AppError } from '@core/errors/AppError';
import { sanitizeForFirestore } from '@core/firebase/firestoreSanitizer';

describe('Error Taxonomy & Firestore Sanitizer', () => {
  describe('mapToAppError', () => {
    it('maps auth/requires-recent-login to AUTH_REQUIRES_RECENT_LOGIN with non-retryable status', () => {
      const fbError = { code: 'auth/requires-recent-login', message: 'User must reauth' };
      const err = mapToAppError(fbError);

      expect(err).toBeInstanceOf(AppError);
      expect(err.code).toBe('AUTH_REQUIRES_RECENT_LOGIN');
      expect(err.isRetryable).toBe(false);
      expect(err.userMessage).toContain('re-authenticate');
    });

    it('maps auth/invalid-credential to AUTH_INVALID_CREDENTIALS', () => {
      const fbError = { code: 'auth/invalid-credential', message: 'Wrong password' };
      const err = mapToAppError(fbError);

      expect(err.code).toBe('AUTH_INVALID_CREDENTIALS');
      expect(err.isRetryable).toBe(false);
    });

    it('maps auth/email-already-in-use to AUTH_EMAIL_IN_USE', () => {
      const fbError = { code: 'auth/email-already-in-use', message: 'Email taken' };
      const err = mapToAppError(fbError);

      expect(err.code).toBe('AUTH_EMAIL_IN_USE');
      expect(err.isRetryable).toBe(false);
    });

    it('maps auth/network-request-failed to retryable NETWORK_ERROR', () => {
      const fbError = { code: 'auth/network-request-failed', message: 'Offline' };
      const err = mapToAppError(fbError);

      expect(err.code).toBe('NETWORK_ERROR');
      expect(err.isRetryable).toBe(true);
    });

    it('maps HTTP status codes accurately', () => {
      const err400 = mapToAppError({ status: 400, message: 'Bad syntax' });
      expect(err400.code).toBe('VALIDATION_ERROR');

      const err401 = mapToAppError({ status: 401, message: 'Invalid API key' });
      expect(err401.code).toBe('AI_INVALID_KEY');

      const err404 = mapToAppError({ status: 404, message: 'Model not found' });
      expect(err404.code).toBe('AI_MODEL_NOT_FOUND');

      const err429 = mapToAppError({ status: 429, message: 'Too many requests' });
      expect(err429.code).toBe('AI_RATE_LIMITED');
      expect(err429.isRetryable).toBe(true);

      const err503 = mapToAppError({ status: 503, message: 'Service unavailable' });
      expect(err503.code).toBe('NETWORK_ERROR');
      expect(err503.isRetryable).toBe(true);
    });

    it('returns existing AppError instance unchanged', () => {
      const original = new AppError({
        code: 'STORAGE_ERROR',
        message: 'Disk full',
      });
      const mapped = mapToAppError(original);
      expect(mapped).toBe(original);
    });
  });

  describe('sanitizeForFirestore', () => {
    it('recursively removes undefined fields while preserving null, primitives, and Dates', () => {
      const testDate = new Date('2026-10-14T12:00:00.000Z');
      const dirtyPayload = {
        name: 'Oatmeal',
        calories: 350,
        notes: undefined,
        verified: null,
        isActive: true,
        loggedAt: testDate,
        subItem: {
          brand: 'Quaker',
          barcode: undefined,
          ingredients: ['oats', undefined, 'salt'],
        },
      };

      const sanitized = sanitizeForFirestore(dirtyPayload);

      expect(sanitized).toEqual({
        name: 'Oatmeal',
        calories: 350,
        verified: null,
        isActive: true,
        loggedAt: testDate,
        subItem: {
          brand: 'Quaker',
          ingredients: ['oats', 'salt'],
        },
      });

      expect('notes' in sanitized).toBe(false);
      expect('barcode' in (sanitized.subItem as Record<string, unknown>)).toBe(false);
    });

    it('handles primitive and null root values safely', () => {
      expect(sanitizeForFirestore(null)).toBeNull();
      expect(sanitizeForFirestore(123)).toBe(123);
      expect(sanitizeForFirestore('test')).toBe('test');
      expect(sanitizeForFirestore(true)).toBe(true);
      expect(sanitizeForFirestore(undefined)).toBeUndefined();
    });
  });
});
