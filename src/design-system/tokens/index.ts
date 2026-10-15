import { colors } from './colors';
import { typography, FontFamilies } from './typography';
import { spacing, layoutSpacing } from './spacing';
import { radii } from './radii';
import { shadows } from './shadows';
import { motion, springs, durations } from './motion';
import { layout, MIN_TOUCH_TARGET, DEFAULT_HIT_SLOP, zIndex } from './layout';

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './radii';
export * from './shadows';
export * from './motion';
export * from './layout';

export const tokens = {
  colors,
  typography,
  FontFamilies,
  spacing,
  layoutSpacing,
  radii,
  shadows,
  motion,
  springs,
  durations,
  layout,
  MIN_TOUCH_TARGET,
  DEFAULT_HIT_SLOP,
  zIndex,
} as const;

export type Tokens = typeof tokens;
