import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { colors, Colors } from '../tokens/colors';
import { typography } from '../tokens/typography';
import { spacing, layoutSpacing } from '../tokens/spacing';
import { radii } from '../tokens/radii';
import { shadows } from '../tokens/shadows';
import { motion } from '../tokens/motion';
import { layout } from '../tokens/layout';
import { Theme, ThemeOverride } from './theme.types';

export const defaultTheme: Theme = {
  colors,
  typography,
  spacing,
  layoutSpacing,
  radii,
  shadows,
  motion,
  layout,
  isDark: false,
};

const ThemeContext = createContext<Theme>(defaultTheme);

export interface ThemeProviderProps {
  children: ReactNode;
  override?: ThemeOverride;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, override }) => {
  const theme = useMemo<Theme>(() => {
    if (!override) return defaultTheme;

    return {
      ...defaultTheme,
      colors: override.colors
        ? ({ ...defaultTheme.colors, ...override.colors } as unknown as Colors)
        : defaultTheme.colors,
      isDark: override.isDark ?? defaultTheme.isDark,
    };
  }, [override]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): Theme => {
  const context = useContext(ThemeContext);
  return context ?? defaultTheme;
};
