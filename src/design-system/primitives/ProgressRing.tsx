import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../tokens/colors';

export interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  arcSweepDegrees?: 270 | 360;
  color?: string;
  trackColor?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 160,
  strokeWidth = 14,
  arcSweepDegrees = 270,
  color = colors.primary,
  trackColor = colors.borderSubtle,
  children,
  style,
  testID,
}) => {
  const safeSize = Math.max(1, typeof size === 'number' && !isNaN(size) ? size : 160);
  const safeStroke = Math.max(1, typeof strokeWidth === 'number' && !isNaN(strokeWidth) ? strokeWidth : 14);
  const radius = Math.max(0.1, (safeSize - safeStroke) / 2);
  const center = safeSize / 2;
  const circumference = 2 * Math.PI * radius;

  const safeProgress =
    typeof progress === 'number' && !isNaN(progress)
      ? Math.max(0, Math.min(1, progress))
      : 0;

  const isFullCircle = arcSweepDegrees === 360;
  const totalArc = isFullCircle ? circumference : circumference * (270 / 360);
  const activeArc = totalArc * safeProgress;
  const rotationAngle = isFullCircle ? -90 : 135;

  return (
    <View
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(safeProgress * 100) }}
      style={[
        styles.container,
        {
          width: safeSize,
          height: safeSize,
        },
        style,
      ]}
    >
      <Svg width={safeSize} height={safeSize}>
        {/* Background Track Circle/Arc */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={safeStroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={isFullCircle ? undefined : `${totalArc} ${circumference}`}
          rotation={rotationAngle}
          originX={center}
          originY={center}
        />

        {/* Foreground Active Progress Arc */}
        {activeArc > 0 ? (
          <Circle
            testID={testID ? `${testID}-indicator` : undefined}
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={safeStroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${activeArc} ${circumference}`}
            rotation={rotationAngle}
            originX={center}
            originY={center}
          />
        ) : null}
      </Svg>

      {children ? (
        <View style={[StyleSheet.absoluteFill, styles.centerOverlay]}>
          {children}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
