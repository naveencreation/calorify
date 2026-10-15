import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import { radii } from '../tokens/radii';
import { AppText } from '../primitives/AppText';
import { AppButton } from '../primitives/AppButton';

export interface EmptyStateViewProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const EmptyStateView: React.FC<EmptyStateViewProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  style,
  testID,
}) => {
  return (
    <View testID={testID} style={[styles.container, style]}>
      {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
      <AppText variant="h3" color={colors.textPrimary} align="center" style={styles.title}>
        {title}
      </AppText>
      <AppText variant="body" color={colors.textSecondary} align="center" style={styles.description}>
        {description}
      </AppText>
      {actionLabel && onAction ? (
        <AppButton
          testID={testID ? `${testID}-action` : undefined}
          title={actionLabel}
          onPress={onAction}
          variant="primary"
          style={styles.actionButton}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.xs,
  },
  description: {
    marginBottom: spacing.lg,
  },
  actionButton: {
    minWidth: 160,
  },
});
