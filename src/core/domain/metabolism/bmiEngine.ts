import { BmiCategory } from './metabolism.types';

export const clampHeightCm = (heightCm: number): number => Math.max(100, Math.min(250, heightCm));

export const clampWeightKg = (weightKg: number): number => Math.max(25, Math.min(350, weightKg));

export const calculateBmi = (weightKg: number, heightCm: number): number => {
  const hM = clampHeightCm(heightCm) / 100;
  const wKg = clampWeightKg(weightKg);
  const rawBmi = wKg / (hM * hM);
  return Math.round(rawBmi * 10) / 10;
};

export const classifyBmi = (bmi: number): BmiCategory => {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  return 'obese';
};

export const getMinSafeTargetWeightKg = (heightCm: number): number => {
  const hM = clampHeightCm(heightCm) / 100;
  const minSafeWeight = 18.5 * (hM * hM);
  return Math.round(minSafeWeight * 10) / 10;
};

export const getEffectiveProteinWeightKg = (weightKg: number, heightCm: number): number => {
  const hM = clampHeightCm(heightCm) / 100;
  const wKg = clampWeightKg(weightKg);
  const bmi = calculateBmi(wKg, heightCm);

  if (bmi <= 30) {
    return wKg;
  }

  const idealWeightAtBmi25 = 25 * (hM * hM);
  const adjustedWeight = idealWeightAtBmi25 + 0.25 * (wKg - idealWeightAtBmi25);
  return Math.round(adjustedWeight * 10) / 10;
};
