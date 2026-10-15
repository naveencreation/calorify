import { BiologicalSex, AgePolicyResult } from './metabolism.types';

export const getSafeCalorieFloor = (sex: BiologicalSex): number => {
  switch (sex) {
    case 'female':
      return 1200;
    case 'male':
      return 1500;
    case 'other':
    case 'prefer_not_to_say':
    default:
      return 1350;
  }
};

export const evaluateAgePolicy = (
  age: number,
  sex: BiologicalSex = 'prefer_not_to_say'
): AgePolicyResult => {
  const minSafeCalorieFloor = getSafeCalorieFloor(sex);

  if (age < 13) {
    return {
      allowed: false,
      forceMaintain: false,
      minSafeCalorieFloor,
      message: 'Calorify is designed for users aged 13 and older.',
    };
  }

  if (age >= 13 && age <= 17) {
    return {
      allowed: true,
      forceMaintain: true,
      minSafeCalorieFloor,
      message:
        'Calorify supports teens with maintenance energy targets to ensure healthy growth and development.',
    };
  }

  return {
    allowed: true,
    forceMaintain: false,
    minSafeCalorieFloor,
  };
};
