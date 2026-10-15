import React from 'react';
import { renderHook } from '@testing-library/react-native';
import {
  colors,
  typography,
  MIN_TOUCH_TARGET,
  ThemeProvider,
  useTheme,
  defaultTheme,
} from '@ds';

describe('Design System Tokens & Theme Verification', () => {
  describe('Color Tokens', () => {
    it('contains all required token keys', () => {
      const requiredKeys = [
        'background',
        'surface',
        'surfaceSubtle',
        'surfaceElevated',
        'primary',
        'primaryPressed',
        'primarySurface',
        'textPrimary',
        'textSecondary',
        'textMuted',
        'textDisabled',
        'textInverse',
        'protein',
        'carbs',
        'fat',
        'fiber',
        'water',
        'steps',
        'weight',
        'streak',
        'success',
        'warning',
        'error',
        'info',
        'border',
        'borderSubtle',
      ] as const;

      for (const key of requiredKeys) {
        expect(colors[key]).toBeDefined();
      }
    });

    it('all color tokens have valid 6-digit hex format', () => {
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
      for (const [key, value] of Object.entries(colors)) {
        expect({ key, value }).toMatchObject({
          value: expect.stringMatching(hexRegex),
        });
      }
    });
  });

  describe('Typography Tokens', () => {
    it('enforces tabular-nums fontVariant on all metric presets', () => {
      const metricPresets = [
        typography.heroMetric,
        typography.metricLarge,
        typography.metricMedium,
      ];

      for (const preset of metricPresets) {
        expect(preset.fontVariant).toBeDefined();
        expect(preset.fontVariant).toContain('tabular-nums');
      }
    });

    it('includes all standard typography scale presets with positive sizes', () => {
      const scaleKeys = [
        'brandTitle',
        'heroMetric',
        'metricLarge',
        'metricMedium',
        'h1',
        'h2',
        'h3',
        'subtitle',
        'body',
        'bodyMedium',
        'caption',
        'overline',
      ] as const;

      for (const key of scaleKeys) {
        const style = typography[key];
        expect(style.fontSize).toBeGreaterThan(0);
        expect(style.lineHeight).toBeGreaterThan(0);
        expect(typeof style.fontFamily).toBe('string');
      }
    });
  });

  describe('Layout & Touch Target Tokens', () => {
    it('enforces minimum touch target of at least 48', () => {
      expect(MIN_TOUCH_TARGET).toBeGreaterThanOrEqual(48);
    });
  });

  describe('ThemeProvider & useTheme Hook', () => {
    it('returns defaultTheme when used without provider override', async () => {
      const { result } = await renderHook(() => useTheme());
      expect(result.current).toEqual(defaultTheme);
      expect(result.current.colors.primary).toBe('#F47551');
      expect(result.current.layout.minTouchTarget).toBe(48);
    });

    it('returns provided theme values within ThemeProvider', async () => {
      const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = await renderHook(() => useTheme(), { wrapper });
      expect(result.current.colors.background).toBe('#FAF9F6');
      expect(result.current.colors.textPrimary).toBe('#0F172A');
      expect(result.current.spacing.md).toBe(16);
      expect(result.current.radii.md).toBe(14);
    });

    it('supports custom theme override through ThemeProvider', async () => {
      const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <ThemeProvider
          override={{
            colors: { primary: '#D95D39' },
            isDark: true,
          }}
        >
          {children}
        </ThemeProvider>
      );

      const { result } = await renderHook(() => useTheme(), { wrapper });
      expect(result.current.colors.primary).toBe('#D95D39');
      expect(result.current.colors.background).toBe('#FAF9F6');
      expect(result.current.isDark).toBe(true);
    });
  });
});
