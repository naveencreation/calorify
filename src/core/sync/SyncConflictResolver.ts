import {
  SyncEntityBase,
  DailyLogDocument,
  SyncedMealEntry,
  SyncedActivityEntry,
  SyncedWaterEntry,
  SyncedWeightEntry,
  SyncedStepEntry,
} from './sync.types';

export class SyncConflictResolver {
  /**
   * Performs a deterministic union merge by entity ID.
   * Compares ISO updatedAt timestamps (newer wins); honors soft-deletion tombstones on ties.
   */
  static mergeEntityLists<T extends SyncEntityBase>(
    localItems: T[] = [],
    cloudItems: T[] = []
  ): T[] {
    const itemMap = new Map<string, T>();

    // Seed with cloud items
    for (const item of cloudItems) {
      if (item && item.id) {
        itemMap.set(item.id, item);
      }
    }

    // Merge local items
    for (const localItem of localItems) {
      if (!localItem || !localItem.id) continue;

      const existing = itemMap.get(localItem.id);
      if (!existing) {
        itemMap.set(localItem.id, localItem);
        continue;
      }

      // Conflict resolution: compare updatedAt timestamps
      const localTime = new Date(localItem.updatedAt || 0).getTime();
      const cloudTime = new Date(existing.updatedAt || 0).getTime();

      if (localTime > cloudTime) {
        itemMap.set(localItem.id, localItem);
      } else if (cloudTime > localTime) {
        itemMap.set(localItem.id, existing);
      } else {
        // Tie-breaker: if one has a deletedAt tombstone, the tombstone wins
        if (localItem.deletedAt && !existing.deletedAt) {
          itemMap.set(localItem.id, localItem);
        } else if (existing.deletedAt && !localItem.deletedAt) {
          itemMap.set(localItem.id, existing);
        } else {
          // Default to local on identical timestamps
          itemMap.set(localItem.id, localItem);
        }
      }
    }

    return Array.from(itemMap.values());
  }

  /**
   * Filters out entities marked with a deletedAt tombstone.
   */
  static getActiveEntities<T extends SyncEntityBase>(items: T[] = []): T[] {
    return items.filter((item) => !item.deletedAt);
  }

  /**
   * Merges local and cloud DailyLog documents without overwriting offline logs.
   * STRICT CONSTRAINT: Never overwrites offline-logged entries when cloudLog already has items.
   */
  static mergeDailyLog(
    localLog: DailyLogDocument | null | undefined,
    cloudLog: DailyLogDocument | null | undefined,
    dateKey: string
  ): DailyLogDocument {
    if (!localLog && !cloudLog) {
      return {
        date: dateKey,
        updatedAt: new Date().toISOString(),
        syncVersion: 1,
        waterMl: 0,
        steps: 0,
        meals: [],
        activities: [],
        waterEntries: [],
        weightEntries: [],
        stepEntries: [],
      };
    }

    const mergedMeals = this.mergeEntityLists<SyncedMealEntry>(
      localLog?.meals ?? [],
      cloudLog?.meals ?? []
    );

    const mergedActivities = this.mergeEntityLists<SyncedActivityEntry>(
      localLog?.activities ?? [],
      cloudLog?.activities ?? []
    );

    const mergedWaterEntries = this.mergeEntityLists<SyncedWaterEntry>(
      localLog?.waterEntries ?? [],
      cloudLog?.waterEntries ?? []
    );

    const mergedWeightEntries = this.mergeEntityLists<SyncedWeightEntry>(
      localLog?.weightEntries ?? [],
      cloudLog?.weightEntries ?? []
    );

    const mergedStepEntries = this.mergeEntityLists<SyncedStepEntry>(
      localLog?.stepEntries ?? [],
      cloudLog?.stepEntries ?? []
    );

    // Active calculations
    const activeWater = this.getActiveEntities(mergedWaterEntries);
    const activeSteps = this.getActiveEntities(mergedStepEntries);
    const activeWeight = this.getActiveEntities(mergedWeightEntries);

    // 1. Water Calculation
    let waterMl = 0;
    if (activeWater.length > 0) {
      waterMl = activeWater.reduce((sum, entry) => sum + (entry.amountMl || 0), 0);
    } else {
      waterMl = Math.max(localLog?.waterMl ?? 0, cloudLog?.waterMl ?? 0);
    }

    // 2. Steps Calculation
    const stepEntriesSum = activeSteps.reduce((sum, entry) => sum + (entry.steps || 0), 0);
    const steps = Math.max(localLog?.steps ?? 0, cloudLog?.steps ?? 0, stepEntriesSum);

    // 3. Weight Calculation (latest active entry or newer log)
    let weightKg: number | undefined;
    if (activeWeight.length > 0) {
      const sorted = [...activeWeight].sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.timestamp || 0).getTime();
        const timeB = new Date(b.updatedAt || b.timestamp || 0).getTime();
        return timeB - timeA;
      });
      weightKg = sorted[0].weightKg;
    } else {
      const localTime = new Date(localLog?.updatedAt || 0).getTime();
      const cloudTime = new Date(cloudLog?.updatedAt || 0).getTime();
      if (localTime >= cloudTime) {
        weightKg = localLog?.weightKg ?? cloudLog?.weightKg;
      } else {
        weightKg = cloudLog?.weightKg ?? localLog?.weightKg;
      }
    }

    // Compute updated timestamp and syncVersion
    const localTime = new Date(localLog?.updatedAt || 0).getTime();
    const cloudTime = new Date(cloudLog?.updatedAt || 0).getTime();
    const updatedAt =
      localTime >= cloudTime
        ? localLog?.updatedAt || new Date().toISOString()
        : cloudLog?.updatedAt || new Date().toISOString();

    const syncVersion = Math.max(localLog?.syncVersion ?? 0, cloudLog?.syncVersion ?? 0) + 1;

    return {
      date: dateKey,
      updatedAt,
      syncVersion,
      waterMl,
      steps,
      weightKg,
      meals: mergedMeals,
      activities: mergedActivities,
      waterEntries: mergedWaterEntries,
      weightEntries: mergedWeightEntries,
      stepEntries: mergedStepEntries,
    };
  }
}
