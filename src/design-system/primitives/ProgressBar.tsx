import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../tokens/colors';
import { radii } from '../tokens/radii';

export interface ProgressBarProps {
  progress: number;
  color?: string;
  trackColor?: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = colors.primary,
  trackColor = colors.borderSubtle,
  height = 8,
  style,
  testID,
}) => {
  const safeProgress =
    typeof progress === 'number' && !isNaN(progress)
      ? Math.max(0, Math.min(1, progress))
      : 0;

  const percentage = Math.round(safeProgress * 100);

  return (
    <View
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: percentage }}
      style={[
        styles.track,
        {
          height,
          backgroundColor: trackColor,
          borderRadius: radii.pill,
        },
        style,
      ]}
    >
      <View
        testID={testID ? `${testID}-indicator` : undefined}
        style={[
          styles.fill,
          {
            width: `${percentage}%`,
            height,
            backgroundColor: color,
            borderRadius: radii.pill,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
