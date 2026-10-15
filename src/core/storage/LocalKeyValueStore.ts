import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildUserStorageKey, sanitizeUidSegment } from './storageKeys';

export class LocalKeyValueStore {
  /**
   * Retrieves a typed value scoped to a specific user UID.
   */
  static async getItem<T>(uid: string, key: string): Promise<T | null> {
    try {
      const storageKey = buildUserStorageKey(uid, key);
      const raw = await AsyncStorage.getItem(storageKey);
      if (raw === null) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return raw as unknown as T;
      }
    } catch {
      return null;
    }
  }

  /**
   * Saves a typed value scoped to a specific user UID.
   */
  static async setItem<T>(uid: string, key: string, value: T): Promise<void> {
    const storageKey = buildUserStorageKey(uid, key);
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    await AsyncStorage.setItem(storageKey, serialized);
  }

  /**
   * Removes a specific key scoped to a user UID.
   */
  static async removeItem(uid: string, key: string): Promise<void> {
    const storageKey = buildUserStorageKey(uid, key);
    await AsyncStorage.removeItem(storageKey);
  }

  /**
   * Atomically clears all AsyncStorage keys for a given user UID.
   */
  static async clearUserScope(uid: string, knownKeys: string[] = []): Promise<void> {
    const userPrefix = `@calorify_v2_${sanitizeUidSegment(uid)}_`;
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const userKeys = allKeys.filter((k) => k.startsWith(userPrefix));
      const explicitKeys = knownKeys.map((k) => buildUserStorageKey(uid, k));
      const combined = Array.from(new Set([...userKeys, ...explicitKeys]));

      if (combined.length > 0) {
        await AsyncStorage.multiRemove(combined);
      }
    } catch {
      for (const k of knownKeys) {
        await AsyncStorage.removeItem(buildUserStorageKey(uid, k)).catch(() => {});
      }
    }
  }
}
