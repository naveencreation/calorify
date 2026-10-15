export const colors = {
  // Warm Porcelain palette
  background: '#FAF9F6',
  surface: '#FFFFFF',
  surfaceSubtle: '#F4F1EA',
  surfaceElevated: '#FFFFFF',

  // Brand Terracotta
  primary: '#F47551',
  primaryPressed: '#D95D39',
  primarySurface: '#FFF0EB',

  // Slate typography hierarchy
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  textDisabled: '#94A3B8',
  textInverse: '#FFFFFF',

  // Semantic macro & domain colors
  protein: '#67BD6E',
  carbs: '#F8D558',
  fat: '#E07A5F',
  fiber: '#8B5CF6',
  water: '#0284C7',
  steps: '#F97316',
  weight: '#10B981',
  streak: '#F47551',

  // Clinical/feedback status colors
  success: '#16A34A',
  warning: '#D97706',
  error: '#DC2626',
  info: '#0284C7',

  // Border tokens
  border: '#E2E8F0',
  borderSubtle: '#F1F5F9',
} as const;

export type ColorToken = keyof typeof colors;
export type Colors = typeof colors;
