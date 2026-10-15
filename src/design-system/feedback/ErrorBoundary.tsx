import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { CrashReporter } from '@core/telemetry/CrashReporter';
import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import { AppText } from '../primitives/AppText';
import { AppButton } from '../primitives/AppButton';
import { AppCard } from '../primitives/AppCard';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  testID?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    CrashReporter.recordError(error, 'ErrorBoundary', {
      componentStack: errorInfo.componentStack ?? '',
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, testID } = this.props;

    if (hasError && error) {
      if (fallback) {
        return fallback(error, this.handleReset);
      }

      return (
        <View testID={testID ?? 'error-boundary-fallback'} style={styles.container}>
          <AppCard variant="elevated" padding="lg" style={styles.card}>
            <AppText variant="h2" color={colors.textPrimary} style={styles.title}>
              Something went wrong
            </AppText>
            <AppText variant="body" color={colors.textSecondary} style={styles.message}>
              {error.message || 'An unexpected error occurred. Please try again.'}
            </AppText>
            <AppButton
              testID="error-boundary-retry-button"
              title="Try Again"
              variant="primary"
              onPress={this.handleReset}
              style={styles.retryButton}
            />
          </AppCard>
        </View>
      );
    }

    return children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  message: {
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    width: '100%',
  },
});
