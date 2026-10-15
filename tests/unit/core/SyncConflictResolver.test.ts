import { SyncConflictResolver } from '@core/sync/SyncConflictResolver';
import { SyncEngine } from '@core/sync/SyncEngine';
import {
  DailyLogDocument,
  SyncedMealEntry,
  SyncedWaterEntry,
} from '@core/sync/sync.types';

describe('SyncConflictResolver & SyncEngine', () => {
  describe('mergeDailyLog Lossless Union', () => {
    it('preserves all meals when cloudLog has breakfast and localLog has offline lunch and dinner', () => {
      const cloudMeal: SyncedMealEntry = {
        id: 'meal_breakfast_1',
        name: 'Oatmeal & Berries',
        calories: 350,
        carbs: 60,
        protein: 15,
        fat: 5,
        mealType: 'breakfast',
        updatedAt: '2026-10-14T08:00:00.000Z',
      };

      const localLunch: SyncedMealEntry = {
        id: 'meal_lunch_2',
        name: 'Grilled Chicken Salad',
        calories: 450,
        carbs: 20,
        protein: 45,
        fat: 20,
        mealType: 'lunch',
        updatedAt: '2026-10-14T13:00:00.000Z',
      };

      const localDinner: SyncedMealEntry = {
        id: 'meal_dinner_3',
        name: 'Salmon & Asparagus',
        calories: 550,
        carbs: 10,
        protein: 40,
        fat: 35,
        mealType: 'dinner',
        updatedAt: '2026-10-14T19:00:00.000Z',
      };

      const cloudLog: DailyLogDocument = {
        date: '2026-10-14',
        updatedAt: '2026-10-14T08:05:00.000Z',
        syncVersion: 1,
        waterMl: 250,
        steps: 2000,
        meals: [cloudMeal],
        activities: [],
        waterEntries: [
          {
            id: 'w_1',
            amountMl: 250,
            updatedAt: '2026-10-14T08:00:00.000Z',
          },
        ],
        weightEntries: [],
        stepEntries: [],
      };

      const localLog: DailyLogDocument = {
        date: '2026-10-14',
        updatedAt: '2026-10-14T19:05:00.000Z',
        syncVersion: 2,
        waterMl: 500,
        steps: 6000,
        meals: [localLunch, localDinner],
        activities: [],
        waterEntries: [
          {
            id: 'w_2',
            amountMl: 500,
            updatedAt: '2026-10-14T13:00:00.000Z',
          },
        ],
        weightEntries: [],
        stepEntries: [],
      };

      const merged = SyncConflictResolver.mergeDailyLog(localLog, cloudLog, '2026-10-14');

      // Crucial: All 3 meals must be present (breakfast from cloud, lunch & dinner from local)
      expect(merged.meals.length).toBe(3);
      const mealIds = merged.meals.map((m) => m.id);
      expect(mealIds).toContain('meal_breakfast_1');
      expect(mealIds).toContain('meal_lunch_2');
      expect(mealIds).toContain('meal_dinner_3');

      // Water entries union: w_1 (250) + w_2 (500) = 750 ml
      expect(merged.waterEntries.length).toBe(2);
      expect(merged.waterMl).toBe(750);

      // Steps: max(local 6000, cloud 2000) = 6000
      expect(merged.steps).toBe(6000);
    });

    it('newer updatedAt wins when an item is modified on both ends', () => {
      const localMeal: SyncedMealEntry = {
        id: 'meal_1',
        name: 'Protein Shake (Local Updated)',
        calories: 300,
        carbs: 10,
        protein: 40,
        fat: 5,
        updatedAt: '2026-10-14T15:00:00.000Z', // Newer
      };

      const cloudMeal: SyncedMealEntry = {
        id: 'meal_1',
        name: 'Protein Shake (Cloud Stale)',
        calories: 250,
        carbs: 10,
        protein: 30,
        fat: 5,
        updatedAt: '2026-10-14T12:00:00.000Z', // Older
      };

      const merged = SyncConflictResolver.mergeEntityLists([localMeal], [cloudMeal]);
      expect(merged.length).toBe(1);
      expect(merged[0].name).toBe('Protein Shake (Local Updated)');
      expect(merged[0].calories).toBe(300);
    });

    it('honors soft-deletion tombstones and prevents deleted items from resurrecting', () => {
      const deletedLocalMeal: SyncedMealEntry = {
        id: 'meal_deleted',
        name: 'Donut',
        calories: 400,
        carbs: 50,
        protein: 2,
        fat: 20,
        updatedAt: '2026-10-14T16:00:00.000Z',
        deletedAt: '2026-10-14T16:00:00.000Z', // Tombstone
      };

      const cloudMeal: SyncedMealEntry = {
        id: 'meal_deleted',
        name: 'Donut',
        calories: 400,
        carbs: 50,
        protein: 2,
        fat: 20,
        updatedAt: '2026-10-14T10:00:00.000Z', // Stale active version
      };

      const merged = SyncConflictResolver.mergeEntityLists([deletedLocalMeal], [cloudMeal]);
      expect(merged.length).toBe(1);
      expect(merged[0].deletedAt).toBeDefined();

      const active = SyncConflictResolver.getActiveEntities(merged);
      expect(active.length).toBe(0); // Soft deleted item is NOT active
    });
  });

  describe('SyncEngine Persistent Outbox', () => {
    beforeEach(async () => {
      await SyncEngine.clearOutbox('user_sync_test');
    });

    it('enqueues mutations and retrieves pending items', async () => {
      await SyncEngine.enqueueMutation('user_sync_test', {
        id: 'mut_1',
        uid: 'user_sync_test',
        collectionPath: 'users/user_sync_test/dailyLogs',
        docId: '2026-10-14',
        payload: { waterMl: 1250 },
      });

      const pending = await SyncEngine.getPendingMutations('user_sync_test');
      expect(pending.length).toBe(1);
      expect(pending[0].docId).toBe('2026-10-14');
      expect(pending[0].retryCount).toBe(0);
    });

    it('flushes outbox and retains failed mutations with incremented retryCount', async () => {
      await SyncEngine.enqueueMutation('user_sync_test', {
        id: 'mut_success',
        uid: 'user_sync_test',
        collectionPath: 'users/user_sync_test/dailyLogs',
        docId: '2026-10-14',
        payload: { steps: 5000 },
      });

      await SyncEngine.enqueueMutation('user_sync_test', {
        id: 'mut_fail',
        uid: 'user_sync_test',
        collectionPath: 'users/user_sync_test/dailyLogs',
        docId: '2026-10-15',
        payload: { steps: 7000 },
      });

      // Executor that fails for mut_fail
      const executor = jest.fn(async (mutation) => {
        if (mutation.id === 'mut_fail') {
          throw new Error('Network timeout');
        }
      });

      const result = await SyncEngine.flushOutbox('user_sync_test', executor);
      expect(result.successful).toBe(1);
      expect(result.failed).toBe(1);

      // Verify that mut_success was removed and mut_fail was retained with retryCount = 1
      const remaining = await SyncEngine.getPendingMutations('user_sync_test');
      expect(remaining.length).toBe(1);
      expect(remaining[0].id).toBe('mut_fail');
      expect(remaining[0].retryCount).toBe(1);
    });
  });
});
