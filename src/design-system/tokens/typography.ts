import { TextStyle } from 'react-native';

export const FontFamilies = {
  kurale: 'Kurale_400Regular',
  poppinsRegular: 'Poppins_400Regular',
  poppinsMedium: 'Poppins_500Medium',
  poppinsSemiBold: 'Poppins_600SemiBold',
  poppinsBold: 'Poppins_700Bold',
  urbanistRegular: 'Urbanist_400Regular',
  urbanistMedium: 'Urbanist_500Medium',
  urbanistSemiBold: 'Urbanist_600SemiBold',
  urbanistBold: 'Urbanist_700Bold',
  urbanistExtraBold: 'Urbanist_800ExtraBold',
} as const;

export type FontFamilyToken = keyof typeof FontFamilies;

export interface TypographyStyle extends TextStyle {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
}

export const typography = {
  brandTitle: {
    fontFamily: FontFamilies.kurale,
    fontSize: 32,
    lineHeight: 38,
  },
  heroMetric: {
    fontFamily: FontFamilies.urbanistBold,
    fontSize: 48,
    lineHeight: 56,
    fontVariant: ['tabular-nums'],
  },
  metricLarge: {
    fontFamily: FontFamilies.urbanistBold,
    fontSize: 32,
    lineHeight: 38,
    fontVariant: ['tabular-nums'],
  },
  metricMedium: {
    fontFamily: FontFamilies.urbanistSemiBold,
    fontSize: 24,
    lineHeight: 30,
    fontVariant: ['tabular-nums'],
  },
  h1: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: 28,
    lineHeight: 34,
  },
  h2: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: 22,
    lineHeight: 28,
  },
  h3: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: 18,
    lineHeight: 24,
  },
  subtitle: {
    fontFamily: FontFamilies.poppinsMedium,
    fontSize: 16,
    lineHeight: 22,
  },
  body: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: 15,
    lineHeight: 22,
  },
  bodyMedium: {
    fontFamily: FontFamilies.poppinsMedium,
    fontSize: 15,
    lineHeight: 22,
  },
  caption: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: 13,
    lineHeight: 18,
  },
  overline: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
} as const satisfies Record<string, TypographyStyle>;

export type TypographyPreset = keyof typeof typography;
export type Typography = typeof typography;
