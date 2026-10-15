import {
  calculateBmr,
  calculateHealthPlan,
  previewPlansByPace,
  calculatePresetPlan,
  ACTIVITY_MULTIPLIERS,
} from '@core/domain/metabolism/metabolicEngine';
import { evaluateAgePolicy } from '@core/domain/metabolism/agePolicyEngine';
import {
  calculateBmi,
  classifyBmi,
  getEffectiveProteinWeightKg,
  getMinSafeTargetWeightKg,
} from '@core/domain/metabolism/bmiEngine';
import { UserBiometricsInput } from '@core/domain/metabolism/metabolism.types';

describe('Metabolic & Clinical Domain Engines', () => {
  describe('BMR & Activity Multiplier Formulas', () => {
    it('calculates standard male BMR accurately using Mifflin-St Jeor', () => {
      // 80kg, 180cm, 30y, male: 10(80) + 6.25(180) - 5(30) + 5 = 800 + 1125 - 150 + 5 = 1780
      const bmr = calculateBmr(80, 180, 30, 'male');
      expect(bmr).toBe(1780);
    });

    it('calculates standard female BMR accurately using Mifflin-St Jeor', () => {
      // 60kg, 165cm, 28y, female: 10(60) + 6.25(165) - 5(28) - 161 = 600 + 1031.25 - 140 - 161 = 1330.25 -> 1330
      const bmr = calculateBmr(60, 165, 28, 'female');
      expect(bmr).toBe(1330);
    });

    it('calculates other / prefer_not_to_say BMR with gender-neutral constant (-78)', () => {
      // 70kg, 170cm, 25y: 10(70) + 6.25(170) - 5(25) - 78 = 700 + 1062.5 - 125 - 78 = 1559.5 -> 1560
      const bmr = calculateBmr(70, 170, 25, 'prefer_not_to_say');
      expect(bmr).toBe(1560);
    });

    it('calculates TDEE across all 4 activity levels for a standard baseline', () => {
      const input: UserBiometricsInput = {
        age: 30,
        sex: 'male',
        heightCm: 180,
        weightKg: 80,
        goal: 'maintain',
      };

      const sedentary = calculateHealthPlan({ ...input, activityLevel: 'sedentary' });
      const lightlyActive = calculateHealthPlan({ ...input, activityLevel: 'lightly_active' });
      const moderatelyActive = calculateHealthPlan({ ...input, activityLevel: 'moderately_active' });
      const veryActive = calculateHealthPlan({ ...input, activityLevel: 'very_active' });

      expect(sedentary.tdee).toBe(Math.round(1780 * ACTIVITY_MULTIPLIERS.sedentary));
      expect(lightlyActive.tdee).toBe(Math.round(1780 * ACTIVITY_MULTIPLIERS.lightly_active));
      expect(moderatelyActive.tdee).toBe(Math.round(1780 * ACTIVITY_MULTIPLIERS.moderately_active));
      expect(veryActive.tdee).toBe(Math.round(1780 * ACTIVITY_MULTIPLIERS.very_active));
    });

    it('applies all 3 deficit paces correctly for weight loss', () => {
      const input: UserBiometricsInput = {
        age: 30,
        sex: 'male',
        heightCm: 180,
        weightKg: 80,
        goal: 'lose_weight',
        activityLevel: 'moderately_active',
      };

      const plans = previewPlansByPace(input);
      const tdee = plans.steady.tdee;

      expect(plans.gentle.dailyCalorieBudget).toBe(Math.round(tdee * 0.90));
      expect(plans.steady.dailyCalorieBudget).toBe(Math.round(tdee * 0.80));
      expect(plans.faster.dailyCalorieBudget).toBe(Math.round(tdee * 0.75));
    });
  });

  describe('Pediatric & Teen Guardrails (agePolicyEngine)', () => {
    it('blocks users under 13 with friendly safety message', () => {
      const policy10 = evaluateAgePolicy(10, 'female');
      const policy12 = evaluateAgePolicy(12, 'male');

      expect(policy10.allowed).toBe(false);
      expect(policy10.forceMaintain).toBe(false);
      expect(policy10.message).toContain('13 and older');

      expect(policy12.allowed).toBe(false);
    });

    it('forces teens (13-17) into maintenance energy support when selecting lose_weight', () => {
      const policy15 = evaluateAgePolicy(15, 'male');
      expect(policy15.allowed).toBe(true);
      expect(policy15.forceMaintain).toBe(true);

      const teenInput: UserBiometricsInput = {
        age: 15,
        sex: 'male',
        heightCm: 170,
        weightKg: 65,
        goal: 'lose_weight',
        pace: 'faster',
      };

      const teenPlan = calculateHealthPlan(teenInput);
      expect(teenPlan.effectiveGoal).toBe('maintain');
      expect(teenPlan.isTeenMaintenanceForced).toBe(true);
      expect(teenPlan.dailyCalorieBudget).toBe(teenPlan.tdee);
      expect(teenPlan.dailyDeficitOrSurplus).toBe(0);
    });

    it('allows adults 18+ to pursue custom goals without forced maintenance', () => {
      const policyAdult = evaluateAgePolicy(25, 'female');
      expect(policyAdult.allowed).toBe(true);
      expect(policyAdult.forceMaintain).toBe(false);

      const adultPlan = calculateHealthPlan({
        age: 25,
        sex: 'female',
        heightCm: 165,
        weightKg: 70,
        goal: 'lose_weight',
      });
      expect(adultPlan.effectiveGoal).toBe('lose_weight');
      expect(adultPlan.isTeenMaintenanceForced).toBe(false);
    });
  });

  describe('High-BMI Edge Cases & Macro Protection (150kg and 180kg)', () => {
    it('prevents zero-carb collapse on a 150kg high-BMI user', () => {
      const highWeightInput: UserBiometricsInput = {
        age: 35,
        sex: 'male',
        heightCm: 175,
        weightKg: 150,
        goal: 'lose_weight',
        pace: 'faster',
        activityLevel: 'sedentary',
      };

      const plan = calculateHealthPlan(highWeightInput);

      // BMI is > 30 -> adjusted body weight applies
      expect(plan.bmi).toBeGreaterThan(30);
      expect(plan.bmiCategory).toBe('obese');

      // Crucial: Carbs must never collapse to 0g
      expect(plan.targetCarbsG).toBeGreaterThan(50);

      // Protein must be clinically capped at 35% of calorie budget
      const proteinKcal = plan.targetProteinG * 4;
      expect(proteinKcal).toBeLessThanOrEqual(plan.dailyCalorieBudget * 0.35 + 4);

      // Total macro calories must match daily budget within rounding tolerance (<= 15 kcal)
      const fatKcal = plan.targetFatG * 9;
      const carbsKcal = plan.targetCarbsG * 4;
      const totalMacroKcal = proteinKcal + fatKcal + carbsKcal;

      expect(Math.abs(totalMacroKcal - plan.dailyCalorieBudget)).toBeLessThanOrEqual(15);
    });

    it('prevents zero-carb collapse on an extreme 180kg user', () => {
      const extremeWeightInput: UserBiometricsInput = {
        age: 40,
        sex: 'female',
        heightCm: 160,
        weightKg: 180,
        goal: 'lose_weight',
        pace: 'faster',
        activityLevel: 'sedentary',
      };

      const plan = calculateHealthPlan(extremeWeightInput);

      expect(plan.targetCarbsG).toBeGreaterThan(40);
      expect(plan.targetProteinG).toBeGreaterThan(60);
      expect(plan.targetFatG).toBeGreaterThan(30);

      const proteinKcal = plan.targetProteinG * 4;
      const fatKcal = plan.targetFatG * 9;
      const carbsKcal = plan.targetCarbsG * 4;
      const totalMacroKcal = proteinKcal + fatKcal + carbsKcal;

      expect(Math.abs(totalMacroKcal - plan.dailyCalorieBudget)).toBeLessThanOrEqual(15);
    });

    it('verifies Adjusted Body Weight calculation for BMI > 30', () => {
      // 175cm: ideal weight at BMI 25 is 25 * (1.75^2) = 76.5625 kg
      // At 150kg: adjusted = 76.5625 + 0.25 * (150 - 76.5625) = 76.5625 + 18.359 = 94.9 kg
      const effectiveWeight = getEffectiveProteinWeightKg(150, 175);
      expect(effectiveWeight).toBeCloseTo(94.9, 0);

      // At normal BMI (65kg, 175cm -> BMI 21.2), effective weight is actual weight
      const normalWeight = getEffectiveProteinWeightKg(65, 175);
      expect(normalWeight).toBe(65);
    });
  });

  describe('BMI Classification & Minimum Safe Target Weight', () => {
    it('classifies all BMI ranges correctly', () => {
      expect(classifyBmi(17.5)).toBe('underweight');
      expect(classifyBmi(22.0)).toBe('normal');
      expect(classifyBmi(27.5)).toBe('overweight');
      expect(classifyBmi(33.0)).toBe('obese');
    });

    it('calculates minimum safe target weight at BMI 18.5', () => {
      // 180cm -> 1.8^2 = 3.24 * 18.5 = 59.94 -> 59.9 kg
      const minSafeWeight = getMinSafeTargetWeightKg(180);
      expect(minSafeWeight).toBe(59.9);
    });
  });

  describe('Dynamic Preset Plans (calculatePresetPlan)', () => {
    it('scales dynamically with user biometrics rather than static magic numbers', () => {
      const femaleSmall = calculatePresetPlan('fat_loss', {
        age: 26,
        sex: 'female',
        heightCm: 155,
        weightKg: 52,
        activityLevel: 'sedentary',
      });

      const maleLarge = calculatePresetPlan('fat_loss', {
        age: 26,
        sex: 'male',
        heightCm: 190,
        weightKg: 105,
        activityLevel: 'very_active',
      });

      expect(femaleSmall.dailyCalorieBudget).toBeLessThan(maleLarge.dailyCalorieBudget);
      expect(femaleSmall.targetProteinG).toBeLessThan(maleLarge.targetProteinG);
      expect(maleLarge.stepGoal).toBe(12000);
      expect(femaleSmall.stepGoal).toBe(6000);
    });
  });
});
