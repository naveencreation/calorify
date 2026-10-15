import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { buildSecureKeyName } from './storageKeys';

export class SecureCredentialVault {
  private static memoryCache = new Map<string, string>();

  /**
   * Sanitizes user-input API keys by stripping common prefixes, quotes, and hidden characters.
   */
  static sanitizeApiKey(rawKey: string): string {
    if (!rawKey || typeof rawKey !== 'string') return '';

    return rawKey
      // Strip zero-width and invisible characters
      .replace(/[\u200B\u200C\u200D\uFEFF]/g, '')
      // Strip bash export prefix
      .replace(/^export\s+GEMINI_API_KEY\s*=\s*/i, '')
      // Strip Bearer prefix
      .replace(/^Bearer\s+/i, '')
      // Strip wrapping quotes
      .replace(/^["']|["']$/g, '')
      .trim();
  }

  /**
   * Masks an API key for safe UI display (e.g., AIza••••••••7x9K).
   */
  static maskApiKey(key: string | null): string {
    if (!key || key.length === 0) return '';
    if (key.length <= 8) return '••••••••';
    const prefix = key.slice(0, 4);
    const suffix = key.slice(-4);
    return `${prefix}••••••••${suffix}`;
  }

  /**
   * Persists a Gemini API key scoped to a specific user UID into hardware storage.
   */
  static async saveGeminiApiKey(uid: string, rawKey: string): Promise<void> {
    if (!uid) throw new Error('SecureCredentialVault: uid is required to save API key.');
    const sanitized = this.sanitizeApiKey(rawKey);
    if (!sanitized) {
      await this.deleteGeminiApiKey(uid);
      return;
    }

    const storageKey = buildSecureKeyName(uid);
    this.memoryCache.set(uid, sanitized);

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(storageKey, sanitized);
      }
      return;
    }

    await SecureStore.setItemAsync(storageKey, sanitized);
  }

  /**
   * Retrieves the Gemini API key scoped to a specific user UID.
   */
  static async getGeminiApiKey(uid: string): Promise<string | null> {
    if (!uid) return null;

    if (this.memoryCache.has(uid)) {
      return this.memoryCache.get(uid) ?? null;
    }

    const storageKey = buildSecureKeyName(uid);
    let key: string | null = null;

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        key = window.localStorage.getItem(storageKey);
      }
    } else {
      try {
        key = await SecureStore.getItemAsync(storageKey);
      } catch {
        key = null;
      }
    }

    if (key) {
      this.memoryCache.set(uid, key);
    }

    return key;
  }

  /**
   * Checks whether an API key exists for a given user UID.
   */
  static async hasGeminiApiKey(uid: string): Promise<boolean> {
    const key = await this.getGeminiApiKey(uid);
    return Boolean(key && key.length > 0);
  }

  /**
   * Deletes the Gemini API key for a given user UID from memory and hardware storage.
   * STRICT REQUIREMENT: Requires explicit UID parameter to avoid orphan keys.
   */
  static async deleteGeminiApiKey(uid: string): Promise<void> {
    if (!uid) throw new Error('SecureCredentialVault: explicit uid is required to delete API key.');

    this.memoryCache.delete(uid);
    const storageKey = buildSecureKeyName(uid);

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(storageKey);
      }
      return;
    }

    try {
      await SecureStore.deleteItemAsync(storageKey);
    } catch {
      // Ignore if key was already absent
    }
  }

  /**
   * Clears the in-memory cache across all UIDs (used during test teardowns and sign-out).
   */
  static clearMemoryCache(): void {
    this.memoryCache.clear();
  }
}
