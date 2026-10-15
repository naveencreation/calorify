import React, { useState } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { colors } from '../tokens/colors';
import { radii } from '../tokens/radii';
import { spacing } from '../tokens/spacing';
import { typography } from '../tokens/typography';
import { MIN_TOUCH_TARGET } from '../tokens/layout';
import { AppText } from './AppText';

export interface AppInputProps extends TextInputProps {
  label?: string;
  errorText?: string;
  helperText?: string;
  leftAccessory?: React.ReactNode;
  rightAccessory?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export const AppInput: React.FC<AppInputProps> = ({
  label,
  errorText,
  helperText,
  leftAccessory,
  rightAccessory,
  containerStyle,
  style,
  onFocus,
  onBlur,
  testID,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const hasError = Boolean(errorText);

  const getBorderColor = (): string => {
    if (hasError) return colors.error;
    if (isFocused) return colors.primary;
    return colors.border;
  };

  return (
    <View style={[styles.root, containerStyle]} testID={testID ? `${testID}-container` : undefined}>
      {label ? (
        <AppText variant="caption" color={colors.textSecondary} style={styles.label}>
          {label}
        </AppText>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          { borderColor: getBorderColor() },
          isFocused && styles.focusedInputContainer,
        ]}
      >
        {leftAccessory ? <View style={styles.leftAccessory}>{leftAccessory}</View> : null}

        <TextInput
          testID={testID}
          style={[styles.input, style]}
          placeholderTextColor={colors.textMuted}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />

        {rightAccessory ? <View style={styles.rightAccessory}>{rightAccessory}</View> : null}
      </View>

      {errorText ? (
        <AppText
          variant="caption"
          color={colors.error}
          style={styles.feedbackText}
          accessibilityLiveRegion="polite"
        >
          {errorText}
        </AppText>
      ) : helperText ? (
        <AppText variant="caption" color={colors.textMuted} style={styles.feedbackText}>
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: '100%',
    marginBottom: spacing.sm,
  },
  label: {
    marginBottom: spacing.xxs,
    fontWeight: '500',
  },
  inputContainer: {
    minHeight: MIN_TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
  },
  focusedInputContainer: {
    backgroundColor: colors.surfaceElevated,
  },
  input: {
    flex: 1,
    minHeight: MIN_TOUCH_TARGET - 4,
    color: colors.textPrimary,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    paddingVertical: spacing.xs,
  },
  leftAccessory: {
    marginRight: spacing.xs,
  },
  rightAccessory: {
    marginLeft: spacing.xs,
  },
  feedbackText: {
    marginTop: spacing.xxs,
  },
});
