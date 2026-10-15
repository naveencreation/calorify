import { Colors } from '../tokens/colors';
import { Typography } from '../tokens/typography';
import { Spacing, layoutSpacing } from '../tokens/spacing';
import { Radii } from '../tokens/radii';
import { Shadows } from '../tokens/shadows';
import { Motion } from '../tokens/motion';
import { Layout } from '../tokens/layout';

export interface Theme {
  colors: Colors;
  typography: Typography;
  spacing: Spacing;
  layoutSpacing: typeof layoutSpacing;
  radii: Radii;
  shadows: Shadows;
  motion: Motion;
  layout: Layout;
  isDark: boolean;
}

export type ThemeOverride = Partial<{
  colors: Partial<Record<keyof Colors, string>>;
  isDark: boolean;
}>;
