import React from 'react';
import {
  Pressable,
  ActivityIndicator,
  StyleSheet,
  View,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { colors } from '../tokens/colors';
import { radii } from '../tokens/radii';
import { spacing } from '../tokens/spacing';
import { MIN_TOUCH_TARGET } from '../tokens/layout';
import { haptics } from '@core/telemetry/haptics';
import { AppText } from './AppText';

export type AppButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type AppButtonSize = 'sm' | 'md' | 'lg';

export interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  testID?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  testID,
  accessibilityLabel,
  style,
  textStyle,
}) => {
  const isInteractive = !disabled && !loading;

  const handlePress = () => {
    if (!isInteractive) return;
    haptics.impactLight();
    onPress();
  };

  const getVariantStyles = (): { container: ViewStyle; textColor: string; spinnerColor: string } => {
    switch (variant) {
      case 'secondary':
        return {
          container: {
            backgroundColor: colors.surfaceSubtle,
            borderWidth: 1,
            borderColor: colors.border,
          },
          textColor: colors.textPrimary,
          spinnerColor: colors.textPrimary,
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: colors.primary,
          },
          textColor: colors.primary,
          spinnerColor: colors.primary,
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          textColor: colors.primary,
          spinnerColor: colors.primary,
        };
      case 'danger':
        return {
          container: {
            backgroundColor: colors.error,
          },
          textColor: colors.textInverse,
          spinnerColor: colors.textInverse,
        };
      case 'primary':
      default:
        return {
          container: {
            backgroundColor: colors.primary,
          },
          textColor: colors.textInverse,
          spinnerColor: colors.textInverse,
        };
    }
  };

  const getSizeStyles = (): { container: ViewStyle; textPreset: 'body' | 'bodyMedium' | 'caption' } => {
    switch (size) {
      case 'sm':
        return {
          container: {
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
          },
          textPreset: 'caption',
        };
      case 'lg':
        return {
          container: {
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.md,
          },
          textPreset: 'bodyMedium',
        };
      case 'md':
      default:
        return {
          container: {
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
          },
          textPreset: 'bodyMedium',
        };
    }
  };

  const { container: variantContainer, textColor, spinnerColor } = getVariantStyles();
  const { container: sizeContainer, textPreset } = getSizeStyles();

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{
        disabled: !isInteractive,
        busy: loading,
      }}
      disabled={!isInteractive}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.base,
        variantContainer,
        sizeContainer,
        pressed && isInteractive && styles.pressed,
        !isInteractive && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} testID={`${testID || 'button'}-loading`} />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon ? <View style={styles.leftIconContainer}>{leftIcon}</View> : null}
          <AppText
            variant={textPreset}
            color={textColor}
            style={[styles.text, textStyle]}
          >
            {title}
          </AppText>
          {rightIcon ? <View style={styles.rightIconContainer}>{rightIcon}</View> : null}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: MIN_TOUCH_TARGET,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  leftIconContainer: {
    marginRight: spacing.xs,
  },
  rightIconContainer: {
    marginLeft: spacing.xs,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.45,
  },
});
