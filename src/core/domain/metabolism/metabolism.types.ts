export type BiologicalSex = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export type GoalType = 'lose_weight' | 'maintain' | 'gain_muscle';

export type GoalPace = 'gentle' | 'steady' | 'faster';

export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';

export type GoalPreset = 'fat_loss' | 'muscle_gain' | 'maintenance';

export type BmiCategory = 'underweight' | 'normal' | 'overweight' | 'obese';

export interface UserBiometricsInput {
  age: number;
  sex: BiologicalSex;
  heightCm: number;
  weightKg: number;
  targetWeightKg?: number;
  goal: GoalType;
  activityLevel?: ActivityLevel;
  pace?: GoalPace;
}

export interface CalculatedHealthPlan {
  bmr: number;
  tdee: number;
  dailyCalorieBudget: number;
  dailyDeficitOrSurplus: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  targetFiberG: number;
  targetWaterMl: number;
  stepGoal: number;
  bmi: number;
  bmiCategory: BmiCategory;
  minSafeTargetWeightKg: number;
  estimatedWeeksToGoal?: number;
  goalDateIso?: string;
  goalDateLabel?: string;
  pace: GoalPace;
  activityLevel: ActivityLevel;
  effectiveGoal: GoalType;
  isAtSafeCalorieFloor: boolean;
  isTeenMaintenanceForced: boolean;
}

export interface AgePolicyResult {
  allowed: boolean;
  forceMaintain: boolean;
  minSafeCalorieFloor: number;
  message?: string;
}
