import React from 'react';
import { View, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../tokens/colors';
import { radii, RadiusToken } from '../tokens/radii';
import { spacing, SpacingToken } from '../tokens/spacing';
import { shadows } from '../tokens/shadows';

export type AppCardVariant = 'elevated' | 'outlined' | 'subtle';

export interface AppCardProps {
  variant?: AppCardVariant;
  padding?: SpacingToken;
  radius?: RadiusToken;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  testID?: string;
  accessibilityLabel?: string;
}

export const AppCard: React.FC<AppCardProps> = ({
  variant = 'elevated',
  padding = 'md',
  radius = 'lg',
  onPress,
  style,
  children,
  testID,
  accessibilityLabel,
}) => {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'subtle':
        return {
          backgroundColor: colors.surfaceSubtle,
          borderWidth: 0,
        };
      case 'elevated':
      default:
        return {
          backgroundColor: colors.surfaceElevated,
          borderWidth: 1,
          borderColor: colors.borderSubtle,
          ...shadows.sm,
        };
    }
  };

  const containerStyle: ViewStyle = {
    ...getVariantStyle(),
    borderRadius: radii[radius] ?? radii.lg,
    padding: spacing[padding] ?? spacing.md,
  };

  if (onPress) {
    return (
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [
          styles.base,
          containerStyle,
          pressed && styles.pressed,
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View testID={testID} style={[styles.base, containerStyle, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.92,
  },
});
