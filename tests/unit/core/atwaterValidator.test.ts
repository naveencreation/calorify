import { validateAndReconcileMacros } from '@core/domain/metabolism/atwaterValidator';

describe('Atwater Thermodynamic Macro Validator', () => {
  it('accepts stated calories when within default 18% tolerance', () => {
    // 25g P, 30g C, 10g F -> 4(25) + 4(30) + 9(10) = 100 + 120 + 90 = 310 kcal
    // Stated calories: 300 kcal (discrepancy = 10 / 300 = 3.3% <= 18%)
    const result = validateAndReconcileMacros({
      calories: 300,
      proteinG: 25,
      carbsG: 30,
      fatG: 10,
    });

    expect(result.isConsistent).toBe(true);
    expect(result.atwaterCorrected).toBe(false);
    expect(result.statedCalories).toBe(300);
    expect(result.atwaterCalories).toBe(310);
    expect(result.reconciledCalories).toBe(300);
    expect(result.discrepancyPercent).toBe(3.3);
  });

  it('corrects stated calories when discrepancy exceeds default 18% tolerance', () => {
    // Food label with typo: says 100 kcal, but macros are 25g P, 30g C, 10g F (= 310 kcal)
    // Discrepancy = 210 / 100 = 210% > 18%
    const result = validateAndReconcileMacros({
      calories: 100,
      proteinG: 25,
      carbsG: 30,
      fatG: 10,
    });

    expect(result.isConsistent).toBe(false);
    expect(result.atwaterCorrected).toBe(true);
    expect(result.statedCalories).toBe(100);
    expect(result.atwaterCalories).toBe(310);
    expect(result.reconciledCalories).toBe(310);
    expect(result.discrepancyPercent).toBe(210);
  });

  it('supports custom tolerance threshold', () => {
    // 10g P, 10g C, 2g F -> 4(10) + 4(10) + 9(2) = 40 + 40 + 18 = 98 kcal
    // Stated: 90 kcal -> 8 / 90 = 8.89%
    const resultStrict = validateAndReconcileMacros({
      calories: 90,
      proteinG: 10,
      carbsG: 10,
      fatG: 2,
      tolerancePercent: 5,
    });

    expect(resultStrict.isConsistent).toBe(false);
    expect(resultStrict.atwaterCorrected).toBe(true);
    expect(resultStrict.reconciledCalories).toBe(98);

    const resultRelaxed = validateAndReconcileMacros({
      calories: 90,
      proteinG: 10,
      carbsG: 10,
      fatG: 2,
      tolerancePercent: 10,
    });

    expect(resultRelaxed.isConsistent).toBe(true);
    expect(resultRelaxed.atwaterCorrected).toBe(false);
    expect(resultRelaxed.reconciledCalories).toBe(90);
  });

  it('handles zero calories and zero macros cleanly', () => {
    const result = validateAndReconcileMacros({
      calories: 0,
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
    });

    expect(result.isConsistent).toBe(true);
    expect(result.atwaterCorrected).toBe(false);
    expect(result.reconciledCalories).toBe(0);
    expect(result.discrepancyPercent).toBe(0);
  });

  it('reconciles when stated calories are 0 but macros are positive', () => {
    const result = validateAndReconcileMacros({
      calories: 0,
      proteinG: 10,
      carbsG: 0,
      fatG: 0,
    });

    expect(result.isConsistent).toBe(false);
    expect(result.atwaterCorrected).toBe(true);
    expect(result.atwaterCalories).toBe(40);
    expect(result.reconciledCalories).toBe(40);
  });
});
