import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import {
  View,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import { radii } from '../tokens/radii';
import { shadows } from '../tokens/shadows';
import { zIndex } from '../tokens/layout';
import { AppText } from '../primitives/AppText';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
  dismissToast: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback(
    (options: ToastOptions) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setToast(options);
      const duration = options.durationMs ?? 3000;
      if (duration > 0) {
        timerRef.current = setTimeout(() => {
          setToast(null);
          timerRef.current = null;
        }, duration);
      }
    },
    []
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const getVariantDetails = (variant: ToastVariant = 'info') => {
    switch (variant) {
      case 'success':
        return {
          iconName: 'check-circle' as const,
          iconColor: colors.success,
          borderColor: colors.success,
        };
      case 'error':
        return {
          iconName: 'alert-circle' as const,
          iconColor: colors.error,
          borderColor: colors.error,
        };
      case 'warning':
        return {
          iconName: 'alert-triangle' as const,
          iconColor: colors.warning,
          borderColor: colors.warning,
        };
      case 'info':
      default:
        return {
          iconName: 'info' as const,
          iconColor: colors.info,
          borderColor: colors.info,
        };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      {toast ? (
        <View style={styles.toastContainer} pointerEvents="box-none">
          <Pressable
            testID="toast-banner"
            accessibilityRole="alert"
            accessibilityLiveRegion="assertive"
            accessibilityLabel={toast.message}
            onPress={dismissToast}
            style={[
              styles.toastBanner,
              { borderLeftColor: getVariantDetails(toast.variant).borderColor },
            ]}
          >
            <Feather
              name={getVariantDetails(toast.variant).iconName}
              size={20}
              color={getVariantDetails(toast.variant).iconColor}
              style={styles.icon}
            />
            <AppText
              variant="bodyMedium"
              color={colors.textPrimary}
              style={styles.message}
            >
              {toast.message}
            </AppText>
          </Pressable>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: spacing.md,
    right: spacing.md,
    zIndex: zIndex.toast,
    alignItems: 'center',
  },
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderLeftWidth: 4,
    ...shadows.md,
    maxWidth: 440,
    width: '100%',
  },
  icon: {
    marginRight: spacing.sm,
  },
  message: {
    flex: 1,
  },
});
