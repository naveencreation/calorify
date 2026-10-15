import { SecureCredentialVault } from '@core/storage/SecureCredentialVault';
import * as SecureStore from 'expo-secure-store';

describe('SecureCredentialVault', () => {
  beforeEach(() => {
    SecureCredentialVault.clearMemoryCache();
    jest.clearAllMocks();
  });

  describe('sanitizeApiKey', () => {
    it('strips quotes, bash export prefix, Bearer keyword, and zero-width spaces', () => {
      const dirty1 = 'export GEMINI_API_KEY="AIzaSyTestKey123"';
      expect(SecureCredentialVault.sanitizeApiKey(dirty1)).toBe('AIzaSyTestKey123');

      const dirty2 = "Bearer 'AIzaSyTestKey456'";
      expect(SecureCredentialVault.sanitizeApiKey(dirty2)).toBe('AIzaSyTestKey456');

      const dirty3 = '\u200BAIzaSyTestKey789\uFEFF';
      expect(SecureCredentialVault.sanitizeApiKey(dirty3)).toBe('AIzaSyTestKey789');
    });

    it('returns empty string for null, undefined, or empty input', () => {
      // @ts-expect-error testing invalid inputs
      expect(SecureCredentialVault.sanitizeApiKey(null)).toBe('');
      // @ts-expect-error testing invalid inputs
      expect(SecureCredentialVault.sanitizeApiKey(undefined)).toBe('');
      expect(SecureCredentialVault.sanitizeApiKey('')).toBe('');
    });
  });

  describe('maskApiKey', () => {
    it('masks key preserving first 4 and last 4 characters', () => {
      expect(SecureCredentialVault.maskApiKey('AIzaSyC6POAupm6uMh20fGUYAtdGLXtTiHFYLfE')).toBe(
        'AIza••••••••YLfE'
      );
      expect(SecureCredentialVault.maskApiKey('AIza1234567890')).toBe('AIza••••••••7890');
    });

    it('returns dots or empty string for short or empty keys', () => {
      expect(SecureCredentialVault.maskApiKey('')).toBe('');
      expect(SecureCredentialVault.maskApiKey(null)).toBe('');
      expect(SecureCredentialVault.maskApiKey('12345')).toBe('••••••••');
    });
  });

  describe('Per-UID Isolation & Explicit Deletion', () => {
    it('saves, retrieves, and isolates keys per user UID', async () => {
      await SecureCredentialVault.saveGeminiApiKey('user_abc', 'AIzaKeyABC');
      await SecureCredentialVault.saveGeminiApiKey('user_xyz', 'AIzaKeyXYZ');

      const keyAbc = await SecureCredentialVault.getGeminiApiKey('user_abc');
      const keyXyz = await SecureCredentialVault.getGeminiApiKey('user_xyz');

      expect(keyAbc).toBe('AIzaKeyABC');
      expect(keyXyz).toBe('AIzaKeyXYZ');
    });

    it('deletes specific UID key without requiring auth.currentUser and without touching other users', async () => {
      await SecureCredentialVault.saveGeminiApiKey('user_abc', 'AIzaKeyABC');
      await SecureCredentialVault.saveGeminiApiKey('user_xyz', 'AIzaKeyXYZ');

      // Explicitly delete user_abc
      await SecureCredentialVault.deleteGeminiApiKey('user_abc');

      expect(await SecureCredentialVault.getGeminiApiKey('user_abc')).toBeNull();
      expect(await SecureCredentialVault.hasGeminiApiKey('user_abc')).toBe(false);

      // Verify user_xyz is untouched
      expect(await SecureCredentialVault.getGeminiApiKey('user_xyz')).toBe('AIzaKeyXYZ');
      expect(await SecureCredentialVault.hasGeminiApiKey('user_xyz')).toBe(true);

      // Verify SecureStore was called with user_abc key
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('calorify_v2_gemini_key_user_abc');
    });

    it('throws error when attempting save or delete without explicit uid', async () => {
      await expect(
        SecureCredentialVault.saveGeminiApiKey('', 'key123')
      ).rejects.toThrow('uid is required');

      await expect(
        SecureCredentialVault.deleteGeminiApiKey('')
      ).rejects.toThrow('explicit uid is required');
    });
  });
});
