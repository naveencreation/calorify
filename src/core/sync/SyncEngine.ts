import { OutboxMutation } from './sync.types';
import { LocalKeyValueStore } from '../storage/LocalKeyValueStore';

const OUTBOX_STORAGE_KEY = 'sync_outbox';

export class SyncEngine {
  /**
   * Enqueues an offline mutation into the user's persistent outbox.
   */
  static async enqueueMutation(
    uid: string,
    mutation: Omit<OutboxMutation, 'queuedAt' | 'retryCount'>
  ): Promise<void> {
    const pending = await this.getPendingMutations(uid);
    const newEntry: OutboxMutation = {
      ...mutation,
      queuedAt: new Date().toISOString(),
      retryCount: 0,
    };

    pending.push(newEntry);
    await LocalKeyValueStore.setItem(uid, OUTBOX_STORAGE_KEY, pending);
  }

  /**
   * Retrieves all pending mutations for a specific user UID.
   */
  static async getPendingMutations(uid: string): Promise<OutboxMutation[]> {
    const items = await LocalKeyValueStore.getItem<OutboxMutation[]>(
      uid,
      OUTBOX_STORAGE_KEY
    );
    return Array.isArray(items) ? items : [];
  }

  /**
   * Flushes the outbox by running the provided executor against each pending mutation.
   * Successfully processed mutations are removed; failed ones are retained with incremented retry count.
   */
  static async flushOutbox(
    uid: string,
    executor: (mutation: OutboxMutation) => Promise<void>
  ): Promise<{ successful: number; failed: number }> {
    const pending = await this.getPendingMutations(uid);
    if (pending.length === 0) {
      return { successful: 0, failed: 0 };
    }

    const remaining: OutboxMutation[] = [];
    let successful = 0;
    let failed = 0;

    for (const mutation of pending) {
      try {
        await executor(mutation);
        successful += 1;
      } catch {
        failed += 1;
        remaining.push({
          ...mutation,
          retryCount: mutation.retryCount + 1,
        });
      }
    }

    await LocalKeyValueStore.setItem(uid, OUTBOX_STORAGE_KEY, remaining);
    return { successful, failed };
  }

  /**
   * Clears the pending outbox queue for a user UID.
   */
  static async clearOutbox(uid: string): Promise<void> {
    await LocalKeyValueStore.removeItem(uid, OUTBOX_STORAGE_KEY);
  }
}
