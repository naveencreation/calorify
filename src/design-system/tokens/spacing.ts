export const spacing = {
  none: 0,
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const layoutSpacing = {
  screenHorizontalPadding: 20,
  cardPadding: 16,
} as const;

export type SpacingToken = keyof typeof spacing;
export type Spacing = typeof spacing;
