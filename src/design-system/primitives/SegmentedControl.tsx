import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { colors } from '../tokens/colors';
import { radii } from '../tokens/radii';
import { spacing } from '../tokens/spacing';
import { shadows } from '../tokens/shadows';
import { MIN_TOUCH_TARGET } from '../tokens/layout';
import { haptics } from '@core/telemetry/haptics';
import { AppText } from './AppText';

export interface SegmentedControlOption<T extends string> {
  label: string;
  value: T;
  testID?: string;
}

export interface SegmentedControlProps<T extends string> {
  options: readonly SegmentedControlOption<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function SegmentedControl<T extends string>({
  options,
  selectedValue,
  onSelect,
  style,
  testID,
}: SegmentedControlProps<T>): React.ReactElement {
  const handleSelect = (val: T) => {
    if (val !== selectedValue) {
      haptics.selectionChanged();
      onSelect(val);
    }
  };

  return (
    <View
      testID={testID}
      accessibilityRole="tablist"
      style={[styles.container, style]}
    >
      {options.map((option) => {
        const isSelected = option.value === selectedValue;
        return (
          <Pressable
            key={option.value}
            testID={option.testID ?? (testID ? `${testID}-${option.value}` : undefined)}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: isSelected }}
            onPress={() => handleSelect(option.value)}
            style={[
              styles.segment,
              isSelected && styles.selectedSegment,
            ]}
          >
            <AppText
              variant="bodyMedium"
              color={isSelected ? colors.textPrimary : colors.textSecondary}
              style={[styles.label, isSelected && styles.selectedLabel]}
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.pill,
    padding: spacing.xxs,
    alignItems: 'center',
    width: '100%',
  },
  segment: {
    flex: 1,
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  selectedSegment: {
    backgroundColor: colors.surfaceElevated,
    ...shadows.sm,
  },
  label: {
    textAlign: 'center',
  },
  selectedLabel: {
    fontWeight: '600',
  },
});
