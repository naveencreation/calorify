export interface SyncEntityBase {
  id: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface SyncedMealEntry extends SyncEntityBase {
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snacks' | string;
  imageUrl?: string;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  servingSize?: number;
  servingUnit?: string;
  items?: unknown[];
}

export interface SyncedActivityEntry extends SyncEntityBase {
  name: string;
  caloriesBurned: number;
  durationMinutes?: number;
  intensity?: 'low' | 'medium' | 'high' | string;
  timestamp?: string;
}

export interface SyncedWaterEntry extends SyncEntityBase {
  amountMl: number;
  timestamp?: string;
}

export interface SyncedWeightEntry extends SyncEntityBase {
  weightKg: number;
  timestamp?: string;
}

export interface SyncedStepEntry extends SyncEntityBase {
  steps: number;
  timestamp?: string;
}

export interface DailyLogDocument {
  date: string;
  updatedAt: string;
  syncVersion?: number;
  waterMl: number;
  steps: number;
  weightKg?: number;
  meals: SyncedMealEntry[];
  activities: SyncedActivityEntry[];
  waterEntries: SyncedWaterEntry[];
  weightEntries: SyncedWeightEntry[];
  stepEntries: SyncedStepEntry[];
}

export interface OutboxMutation {
  id: string;
  uid: string;
  collectionPath: string;
  docId: string;
  payload: Record<string, unknown>;
  queuedAt: string;
  retryCount: number;
}
