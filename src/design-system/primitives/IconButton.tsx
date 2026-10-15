import React from 'react';
import {
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
  View,
} from 'react-native';
import { colors } from '../tokens/colors';
import { radii } from '../tokens/radii';
import { MIN_TOUCH_TARGET, DEFAULT_HIT_SLOP } from '../tokens/layout';
import { haptics } from '@core/telemetry/haptics';

export type IconButtonVariant = 'default' | 'surface' | 'primary' | 'danger';

export interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
  size?: number;
  variant?: IconButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  accessibilityLabel,
  size = MIN_TOUCH_TARGET,
  variant = 'default',
  disabled = false,
  style,
  testID,
}) => {
  const targetDimension = Math.max(size, MIN_TOUCH_TARGET);

  const handlePress = () => {
    if (disabled) return;
    haptics.impactLight();
    onPress();
  };

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'surface':
        return {
          backgroundColor: colors.surfaceSubtle,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'primary':
        return {
          backgroundColor: colors.primary,
        };
      case 'danger':
        return {
          backgroundColor: colors.error,
        };
      case 'default':
      default:
        return {
          backgroundColor: 'transparent',
        };
    }
  };

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      hitSlop={DEFAULT_HIT_SLOP}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.base,
        {
          width: targetDimension,
          height: targetDimension,
          borderRadius: radii.pill,
        },
        getVariantStyles(),
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.iconWrapper}>{icon}</View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.95 }],
  },
  disabled: {
    opacity: 0.4,
  },
});
