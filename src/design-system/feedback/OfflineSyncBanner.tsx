import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import { radii } from '../tokens/radii';
import { AppText } from '../primitives/AppText';
import { AppButton } from '../primitives/AppButton';

export interface OfflineSyncBannerProps {
  isOffline: boolean;
  pendingSyncCount?: number;
  onRetrySync?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const OfflineSyncBanner: React.FC<OfflineSyncBannerProps> = ({
  isOffline,
  pendingSyncCount = 0,
  onRetrySync,
  style,
  testID,
}) => {
  const hasPending = pendingSyncCount > 0;

  // Render nothing if online and no pending sync items
  if (!isOffline && !hasPending) {
    return null;
  }

  const message = isOffline
    ? hasPending
      ? `Offline: ${pendingSyncCount} changes saved locally`
      : 'You are offline. Showing cached data'
    : `${pendingSyncCount} changes pending sync`;

  return (
    <View
      testID={testID}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[
        styles.container,
        isOffline ? styles.offlineBg : styles.syncingBg,
        style,
      ]}
    >
      <View style={styles.contentRow}>
        <Feather
          name={isOffline ? 'cloud-off' : 'refresh-cw'}
          size={18}
          color={isOffline ? colors.warning : colors.info}
          style={styles.icon}
        />
        <AppText
          variant="caption"
          color={colors.textPrimary}
          style={styles.message}
        >
          {message}
        </AppText>
      </View>

      {onRetrySync ? (
        <AppButton
          testID={testID ? `${testID}-retry` : undefined}
          title="Sync Now"
          size="sm"
          variant="secondary"
          onPress={onRetrySync}
          style={styles.actionButton}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderWidth: 1,
  },
  offlineBg: {
    backgroundColor: '#FEF9C3', // subtle warning surface
    borderColor: colors.warning,
  },
  syncingBg: {
    backgroundColor: '#E0F2FE', // subtle info surface
    borderColor: colors.info,
  },
  contentRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  icon: {
    marginRight: spacing.xs,
  },
  message: {
    flex: 1,
    fontWeight: '500',
  },
  actionButton: {
    minHeight: 36,
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.sm,
  },
});
