export interface MacroValidationInput {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  tolerancePercent?: number;
}

export interface MacroValidationResult {
  isConsistent: boolean;
  statedCalories: number;
  atwaterCalories: number;
  reconciledCalories: number;
  discrepancyPercent: number;
  atwaterCorrected: boolean;
}

export const validateAndReconcileMacros = (
  input: MacroValidationInput
): MacroValidationResult => {
  const { calories, proteinG, carbsG, fatG, tolerancePercent = 18 } = input;
  const atwaterKcal = Math.max(0, 4 * proteinG + 4 * carbsG + 9 * fatG);
  const statedCalories = Math.max(0, calories);

  let discrepancyPercent = 0;
  if (statedCalories === 0 && atwaterKcal === 0) {
    discrepancyPercent = 0;
  } else if (statedCalories === 0 && atwaterKcal > 0) {
    discrepancyPercent = 100;
  } else {
    discrepancyPercent = (Math.abs(statedCalories - atwaterKcal) / statedCalories) * 100;
  }

  const roundedDiscrepancy = Math.round(discrepancyPercent * 10) / 10;
  const roundedAtwater = Math.round(atwaterKcal);

  if (discrepancyPercent > tolerancePercent) {
    return {
      isConsistent: false,
      statedCalories,
      atwaterCalories: roundedAtwater,
      reconciledCalories: roundedAtwater,
      discrepancyPercent: roundedDiscrepancy,
      atwaterCorrected: true,
    };
  }

  return {
    isConsistent: true,
    statedCalories,
    atwaterCalories: roundedAtwater,
    reconciledCalories: statedCalories,
    discrepancyPercent: roundedDiscrepancy,
    atwaterCorrected: false,
  };
};
