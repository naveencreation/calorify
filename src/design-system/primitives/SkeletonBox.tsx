import React from 'react';
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  DimensionValue,
} from 'react-native';
import { colors } from '../tokens/colors';
import { radii, RadiusToken } from '../tokens/radii';

export interface SkeletonBoxProps {
  width?: DimensionValue;
  height?: number;
  radius?: RadiusToken;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const SkeletonBox: React.FC<SkeletonBoxProps> = ({
  width = '100%',
  height = 16,
  radius = 'sm',
  style,
  testID,
}) => {
  return (
    <View
      testID={testID}
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: radii[radius] ?? radii.sm,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.surfaceSubtle,
    overflow: 'hidden',
  },
});
