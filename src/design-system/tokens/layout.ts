import { Insets } from 'react-native';

export const MIN_TOUCH_TARGET = 48;

export const DEFAULT_HIT_SLOP: Insets = {
  top: 8,
  bottom: 8,
  left: 8,
  right: 8,
} as const;

export const zIndex = {
  base: 0,
  card: 1,
  dropdown: 10,
  sticky: 50,
  header: 60,
  modal: 100,
  toast: 200,
  tooltip: 300,
} as const;

export const layout = {
  minTouchTarget: MIN_TOUCH_TARGET,
  defaultHitSlop: DEFAULT_HIT_SLOP,
  zIndex,
} as const;

export type ZIndexToken = keyof typeof zIndex;
export type Layout = typeof layout;
