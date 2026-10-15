import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { TypographyPreset, typography } from '../tokens/typography';
import { colors } from '../tokens/colors';

export interface AppTextProps extends TextProps {
  variant?: TypographyPreset;
  color?: string;
  align?: 'left' | 'center' | 'right';
  tabularNums?: boolean;
  children?: React.ReactNode;
}

export const AppText: React.FC<AppTextProps> = ({
  variant = 'body',
  color = colors.textPrimary,
  align = 'left',
  tabularNums = false,
  style,
  children,
  ...rest
}) => {
  const baseStyle = typography[variant] || typography.body;
  const computedStyle: TextStyle = {
    color,
    textAlign: align,
  };

  if (tabularNums) {
    computedStyle.fontVariant = ['tabular-nums'];
  }

  return (
    <Text style={[baseStyle, computedStyle, style]} {...rest}>
      {children}
    </Text>
  );
};
