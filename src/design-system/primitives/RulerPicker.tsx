import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../tokens/colors';
import { radii } from '../tokens/radii';
import { spacing } from '../tokens/spacing';
import { MIN_TOUCH_TARGET, DEFAULT_HIT_SLOP } from '../tokens/layout';
import { haptics } from '@core/telemetry/haptics';
import { AppText } from './AppText';
import { IconButton } from './IconButton';

export interface RulerPickerProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  label?: string;
  onValueChange: (nextValue: number) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const RulerPicker: React.FC<RulerPickerProps> = ({
  value,
  min,
  max,
  step = 1,
  unit,
  label,
  onValueChange,
  style,
  testID,
}) => {
  const precision = step.toString().includes('.')
    ? step.toString().split('.')[1]?.length ?? 0
    : 0;

  const clampAndRound = (val: number): number => {
    const stepped = Math.round((val - min) / step) * step + min;
    const clamped = Math.max(min, Math.min(max, stepped));
    return Number(clamped.toFixed(precision));
  };

  const updateValue = (next: number) => {
    const clamped = clampAndRound(next);
    if (clamped !== value) {
      haptics.selectionChanged();
      onValueChange(clamped);
    }
  };

  const isAtMin = value <= min;
  const isAtMax = value >= max;

  return (
    <View style={[styles.container, style]} testID={testID}>
      {label ? (
        <AppText variant="caption" color={colors.textSecondary} style={styles.label}>
          {label}
        </AppText>
      ) : null}

      <View style={styles.controlsRow}>
        {/* Quick jump -5 */}
        <Pressable
          testID={testID ? `${testID}-jump-minus` : undefined}
          accessibilityRole="button"
          accessibilityLabel={`Decrease by ${5 * step} ${unit}`}
          accessibilityState={{ disabled: isAtMin }}
          disabled={isAtMin}
          hitSlop={DEFAULT_HIT_SLOP}
          onPress={() => updateValue(value - 5 * step)}
          style={({ pressed }) => [
            styles.quickJumpButton,
            isAtMin && styles.disabled,
            pressed && !isAtMin && styles.pressed,
          ]}
        >
          <AppText
            variant="caption"
            color={isAtMin ? colors.textDisabled : colors.primary}
            style={styles.quickJumpText}
          >
            {`-${5 * step}`}
          </AppText>
        </Pressable>

        {/* Fine step - */}
        <IconButton
          testID={testID ? `${testID}-step-minus` : undefined}
          accessibilityLabel={`Decrease by ${step} ${unit}`}
          disabled={isAtMin}
          variant="surface"
          icon={<Feather name="minus" size={20} color={isAtMin ? colors.textDisabled : colors.textPrimary} />}
          onPress={() => updateValue(value - step)}
        />

        {/* Value Readout */}
        <View style={styles.valueContainer}>
          <AppText
            testID={testID ? `${testID}-value` : undefined}
            variant="heroMetric"
            tabularNums
            color={colors.textPrimary}
            style={styles.valueText}
          >
            {value.toFixed(precision)}
          </AppText>
          <AppText
            variant="caption"
            color={colors.textSecondary}
            style={styles.unitText}
          >
            {unit}
          </AppText>
        </View>

        {/* Fine step + */}
        <IconButton
          testID={testID ? `${testID}-step-plus` : undefined}
          accessibilityLabel={`Increase by ${step} ${unit}`}
          disabled={isAtMax}
          variant="surface"
          icon={<Feather name="plus" size={20} color={isAtMax ? colors.textDisabled : colors.textPrimary} />}
          onPress={() => updateValue(value + step)}
        />

        {/* Quick jump +5 */}
        <Pressable
          testID={testID ? `${testID}-jump-plus` : undefined}
          accessibilityRole="button"
          accessibilityLabel={`Increase by ${5 * step} ${unit}`}
          accessibilityState={{ disabled: isAtMax }}
          disabled={isAtMax}
          hitSlop={DEFAULT_HIT_SLOP}
          onPress={() => updateValue(value + 5 * step)}
          style={({ pressed }) => [
            styles.quickJumpButton,
            isAtMax && styles.disabled,
            pressed && !isAtMax && styles.pressed,
          ]}
        >
          <AppText
            variant="caption"
            color={isAtMax ? colors.textDisabled : colors.primary}
            style={styles.quickJumpText}
          >
            {`+${5 * step}`}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  label: {
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  quickJumpButton: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  quickJumpText: {
    fontWeight: '700',
  },
  valueContainer: {
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  valueText: {
    lineHeight: 48,
  },
  unitText: {
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  disabled: {
    opacity: 0.35,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
});
