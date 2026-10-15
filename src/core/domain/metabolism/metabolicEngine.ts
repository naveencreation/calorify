import {
  BiologicalSex,
  GoalType,
  GoalPace,
  ActivityLevel,
  GoalPreset,
  UserBiometricsInput,
  CalculatedHealthPlan,
} from './metabolism.types';
import { evaluateAgePolicy, getSafeCalorieFloor } from './agePolicyEngine';
import {
  calculateBmi,
  classifyBmi,
  getMinSafeTargetWeightKg,
  getEffectiveProteinWeightKg,
} from './bmiEngine';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
};

export const STEP_GOALS: Record<ActivityLevel, number> = {
  sedentary: 6000,
  lightly_active: 8000,
  moderately_active: 10000,
  very_active: 12000,
};

export const calculateBmr = (
  weightKg: number,
  heightCm: number,
  age: number,
  sex: BiologicalSex
): number => {
  let s: number;
  switch (sex) {
    case 'male':
      s = 5;
      break;
    case 'female':
      s = -161;
      break;
    case 'other':
    case 'prefer_not_to_say':
    default:
      s = -78;
      break;
  }
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + s);
};

export const calculateHealthPlan = (
  input: UserBiometricsInput,
  fromDate?: Date
): CalculatedHealthPlan => {
  const age = Math.max(13, Math.min(100, input.age));
  const weightKg = Math.max(30, Math.min(300, input.weightKg));
  const heightCm = Math.max(100, Math.min(250, input.heightCm));
  const activityLevel: ActivityLevel = input.activityLevel ?? 'sedentary';
  const pace: GoalPace = input.pace ?? 'steady';

  // Evaluate pediatric and age safety policies
  const agePolicy = evaluateAgePolicy(age, input.sex);
  const isTeenMaintenanceForced = agePolicy.forceMaintain && input.goal === 'lose_weight';
  const effectiveGoal: GoalType = isTeenMaintenanceForced ? 'maintain' : input.goal;

  // Metabolic Baselines
  const bmr = calculateBmr(weightKg, heightCm, age, input.sex);
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel];
  const tdee = Math.round(bmr * multiplier);

  // Raw Calorie Budget Calculation
  let rawBudget: number;
  if (effectiveGoal === 'lose_weight') {
    switch (pace) {
      case 'gentle':
        rawBudget = Math.round(tdee * 0.90);
        break;
      case 'steady':
        rawBudget = Math.round(tdee * 0.80);
        break;
      case 'faster':
        rawBudget = Math.round(tdee * 0.75);
        break;
      default:
        rawBudget = Math.round(tdee * 0.80);
        break;
    }
  } else if (effectiveGoal === 'gain_muscle') {
    switch (pace) {
      case 'gentle':
        rawBudget = tdee + 150;
        break;
      case 'steady':
        rawBudget = tdee + 300;
        break;
      case 'faster':
        rawBudget = tdee + 450;
        break;
      default:
        rawBudget = tdee + 300;
        break;
    }
  } else {
    rawBudget = tdee;
  }

  // Enforce Gender-Specific Safe Calorie Floor
  const safeFloor = getSafeCalorieFloor(input.sex);
  const isAtSafeCalorieFloor = rawBudget < safeFloor;
  const dailyCalorieBudget = Math.max(safeFloor, rawBudget);
  const dailyDeficitOrSurplus = dailyCalorieBudget - tdee;

  // Adjusted Protein Calculation to avoid high-weight zero-carb crashes
  const effectiveProteinWeight = getEffectiveProteinWeightKg(weightKg, heightCm);
  const proteinMultiplier = effectiveGoal === 'gain_muscle' ? 2.2 : 1.8;
  const rawProteinG = Math.round(effectiveProteinWeight * proteinMultiplier);
  const maxProteinKcal = dailyCalorieBudget * 0.35;
  const targetProteinG = Math.min(rawProteinG, Math.floor(maxProteinKcal / 4));

  // Fat (28% of budget)
  const targetFatG = Math.round((dailyCalorieBudget * 0.28) / 9);

  // Carbs (remaining calories, guaranteed >= 37% by virtue of protein <= 35% & fat = 28%)
  const proteinKcal = targetProteinG * 4;
  const fatKcal = targetFatG * 9;
  const remainingKcal = Math.max(0, dailyCalorieBudget - proteinKcal - fatKcal);
  const targetCarbsG = Math.round(remainingKcal / 4);

  // Micro/Hydration Targets
  const targetFiberG = Math.round((dailyCalorieBudget / 1000) * 14);
  const targetWaterMl = Math.max(2000, Math.round((weightKg * 35) / 100) * 100);
  const stepGoal = STEP_GOALS[activityLevel];

  // BMI Metrics
  const bmi = calculateBmi(weightKg, heightCm);
  const bmiCategory = classifyBmi(bmi);
  const minSafeTargetWeightKg = getMinSafeTargetWeightKg(heightCm);

  // Estimated Timeline Calculation
  let estimatedWeeksToGoal: number | undefined;
  let goalDateIso: string | undefined;
  let goalDateLabel: string | undefined;

  if (input.targetWeightKg != null && input.targetWeightKg !== weightKg && dailyDeficitOrSurplus !== 0) {
    const weightDeltaKg = Math.abs(weightKg - input.targetWeightKg);
    const weeklyRate = Math.abs(dailyDeficitOrSurplus) * 7;
    // 7700 kcal is approximately 1kg body fat
    estimatedWeeksToGoal = Math.max(1, Math.round((weightDeltaKg * 7700) / weeklyRate));

    const baseDate = fromDate ?? new Date();
    const targetDate = new Date(baseDate.getTime() + estimatedWeeksToGoal * 7 * 24 * 60 * 60 * 1000);
    goalDateIso = targetDate.toISOString();
    goalDateLabel = targetDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return {
    bmr,
    tdee,
    dailyCalorieBudget,
    dailyDeficitOrSurplus,
    targetProteinG,
    targetCarbsG,
    targetFatG,
    targetFiberG,
    targetWaterMl,
    stepGoal,
    bmi,
    bmiCategory,
    minSafeTargetWeightKg,
    estimatedWeeksToGoal,
    goalDateIso,
    goalDateLabel,
    pace,
    activityLevel,
    effectiveGoal,
    isAtSafeCalorieFloor,
    isTeenMaintenanceForced,
  };
};

export const previewPlansByPace = (
  input: UserBiometricsInput,
  fromDate?: Date
): Record<GoalPace, CalculatedHealthPlan> => {
  return {
    gentle: calculateHealthPlan({ ...input, pace: 'gentle' }, fromDate),
    steady: calculateHealthPlan({ ...input, pace: 'steady' }, fromDate),
    faster: calculateHealthPlan({ ...input, pace: 'faster' }, fromDate),
  };
};

export const calculatePresetPlan = (
  preset: GoalPreset,
  biometrics: Omit<UserBiometricsInput, 'goal' | 'pace'>
): CalculatedHealthPlan => {
  switch (preset) {
    case 'fat_loss':
      return calculateHealthPlan({ ...biometrics, goal: 'lose_weight', pace: 'steady' });
    case 'muscle_gain':
      return calculateHealthPlan({ ...biometrics, goal: 'gain_muscle', pace: 'steady' });
    case 'maintenance':
      return calculateHealthPlan({ ...biometrics, goal: 'maintain', pace: 'steady' });
    default:
      return calculateHealthPlan({ ...biometrics, goal: 'maintain', pace: 'steady' });
  }
};
