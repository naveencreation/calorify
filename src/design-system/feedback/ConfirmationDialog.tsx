import React from 'react';
import {
  Modal,
  View,
  Pressable,
  StyleSheet,
} from 'react-native';
import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import { radii } from '../tokens/radii';
import { shadows } from '../tokens/shadows';
import { AppText } from '../primitives/AppText';
import { AppButton } from '../primitives/AppButton';

export interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  testID?: string;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  loading = false,
  onConfirm,
  onCancel,
  testID,
}) => {
  return (
    <Modal
      testID={testID}
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      accessibilityViewIsModal
    >
      <View style={styles.overlay}>
        <Pressable
          testID={testID ? `${testID}-backdrop` : 'confirmation-backdrop'}
          accessibilityLabel="Dismiss dialog"
          accessibilityRole="button"
          style={styles.backdrop}
          onPress={onCancel}
          disabled={loading}
        />
        <View
          testID={testID ? `${testID}-card` : 'confirmation-dialog-card'}
          accessibilityRole="alert"
          style={styles.card}
        >
          <AppText variant="h3" color={colors.textPrimary} style={styles.title}>
            {title}
          </AppText>
          <AppText variant="body" color={colors.textSecondary} style={styles.message}>
            {message}
          </AppText>

          <View style={styles.actionsRow}>
            <AppButton
              testID={testID ? `${testID}-cancel` : 'confirmation-cancel-button'}
              title={cancelLabel}
              variant="ghost"
              onPress={onCancel}
              disabled={loading}
              style={styles.actionButton}
            />
            <AppButton
              testID={testID ? `${testID}-confirm` : 'confirmation-confirm-button'}
              title={confirmLabel}
              variant={variant === 'danger' ? 'danger' : 'primary'}
              onPress={onConfirm}
              loading={loading}
              disabled={loading}
              style={styles.actionButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.xl,
    padding: spacing.lg,
    ...shadows.lg,
    zIndex: 1,
  },
  title: {
    marginBottom: spacing.xs,
  },
  message: {
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  actionButton: {
    minWidth: 100,
  },
});
