import React from 'react';
import { Text, View } from 'react-native';
import {
  render,
  fireEvent,
  screen,
  act,
  cleanup,
  renderHook,
} from '@testing-library/react-native';
import {
  AppText,
  AppButton,
  AppCard,
  AppInput,
  IconButton,
  ProgressBar,
  ProgressRing,
  SegmentedControl,
  RulerPicker,
  SkeletonBox,
  ErrorBoundary,
  EmptyStateView,
  OfflineSyncBanner,
  ConfirmationDialog,
  ToastProvider,
  useToast,
  MIN_TOUCH_TARGET,
  colors,
} from '@ds';
import { CrashReporter } from '@core/telemetry/CrashReporter';
import { haptics } from '@core/telemetry/haptics';

describe('Design System Primitives & Feedback Surfaces', () => {
  afterEach(async () => {
    await cleanup();
    jest.clearAllMocks();
  });

  describe('AppText', () => {
    it('renders text with default body variant', async () => {
      await render(<AppText testID="text-default">Calorie Target</AppText>);
      const text = screen.getByTestId('text-default');
      expect(text.props.children).toBe('Calorie Target');
    });

    it('applies tabular-nums fontVariant when tabularNums is true', async () => {
      await render(
        <AppText testID="text-tabular" tabularNums>
          2450
        </AppText>
      );
      const text = screen.getByTestId('text-tabular');
      const flatStyle = [text.props.style].flat().reduce((acc, s) => ({ ...acc, ...s }), {});
      expect(flatStyle.fontVariant).toContain('tabular-nums');
    });

    it('applies text alignment correctly', async () => {
      await render(
        <AppText testID="text-aligned" align="center">
          Centered
        </AppText>
      );
      const text = screen.getByTestId('text-aligned');
      const flatStyle = [text.props.style].flat().reduce((acc, s) => ({ ...acc, ...s }), {});
      expect(flatStyle.textAlign).toBe('center');
    });
  });

  describe('AppButton', () => {
    it('calls onPress and triggers light haptic feedback when pressed', async () => {
      const onPress = jest.fn();
      const hapticSpy = jest.spyOn(haptics, 'impactLight');

      await render(<AppButton testID="test-button" title="Log Meal" onPress={onPress} />);
      const button = screen.getByTestId('test-button');

      await fireEvent.press(button);

      expect(onPress).toHaveBeenCalledTimes(1);
      expect(hapticSpy).toHaveBeenCalledTimes(1);
    });

    it('blocks onPress and does not trigger haptics when disabled', async () => {
      const onPress = jest.fn();
      const hapticSpy = jest.spyOn(haptics, 'impactLight');

      await render(<AppButton testID="disabled-button" title="Disabled" onPress={onPress} disabled />);
      const button = screen.getByTestId('disabled-button');

      await fireEvent.press(button);

      expect(onPress).not.toHaveBeenCalled();
      expect(hapticSpy).not.toHaveBeenCalled();
      expect(button.props.accessibilityState).toMatchObject({ disabled: true, busy: false });
    });

    it('blocks onPress and exposes busy accessibilityState when loading', async () => {
      const onPress = jest.fn();
      const hapticSpy = jest.spyOn(haptics, 'impactLight');

      await render(<AppButton testID="loading-button" title="Saving" onPress={onPress} loading />);
      const button = screen.getByTestId('loading-button');

      await fireEvent.press(button);

      expect(onPress).not.toHaveBeenCalled();
      expect(hapticSpy).not.toHaveBeenCalled();
      expect(button.props.accessibilityState).toMatchObject({ disabled: true, busy: true });
      expect(screen.getByTestId('loading-button-loading')).toBeTruthy();
    });

    it('enforces MIN_TOUCH_TARGET height of at least 48dp', async () => {
      await render(<AppButton testID="touch-target-button" title="Target" onPress={jest.fn()} />);
      const button = screen.getByTestId('touch-target-button');
      const flatStyle = [button.props.style].flat().reduce((acc, s) => ({ ...acc, ...s }), {});
      expect(flatStyle.minHeight).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    });
  });

  describe('AppCard', () => {
    it('renders children within elevated card by default', async () => {
      await render(
        <AppCard testID="app-card">
          <Text>Card Content</Text>
        </AppCard>
      );
      expect(screen.getByText('Card Content')).toBeTruthy();
      const card = screen.getByTestId('app-card');
      const flatStyle = [card.props.style].flat().reduce((acc, s) => ({ ...acc, ...s }), {});
      expect(flatStyle.backgroundColor).toBe(colors.surfaceElevated);
    });

    it('supports onPress interaction when provided', async () => {
      const onPress = jest.fn();
      await render(
        <AppCard testID="clickable-card" onPress={onPress}>
          <Text>Clickable</Text>
        </AppCard>
      );
      const card = screen.getByTestId('clickable-card');
      await fireEvent.press(card);
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('AppInput', () => {
    it('renders label, handles text input, and renders helperText', async () => {
      const onChangeText = jest.fn();
      await render(
        <AppInput
          testID="app-input"
          label="Weight"
          placeholder="Enter weight in kg"
          helperText="Include decimals if known"
          onChangeText={onChangeText}
        />
      );

      expect(screen.getByText('Weight')).toBeTruthy();
      expect(screen.getByText('Include decimals if known')).toBeTruthy();

      const input = screen.getByTestId('app-input');
      await fireEvent.changeText(input, '78.5');

      expect(onChangeText).toHaveBeenCalledWith('78.5');
    });

    it('renders errorText with polite accessibility live region', async () => {
      await render(
        <AppInput
          testID="error-input"
          label="Email"
          errorText="Invalid email format"
        />
      );

      const errorLabel = screen.getByText('Invalid email format');
      expect(errorLabel).toBeTruthy();
      expect(errorLabel.props.accessibilityLiveRegion).toBe('polite');
    });
  });

  describe('IconButton', () => {
    it('requires accessibilityLabel and calls onPress with haptics', async () => {
      const onPress = jest.fn();
      const hapticSpy = jest.spyOn(haptics, 'impactLight');

      await render(
        <IconButton
          testID="icon-btn"
          accessibilityLabel="Add item"
          icon={<Text>+</Text>}
          onPress={onPress}
        />
      );

      const button = screen.getByTestId('icon-btn');
      expect(button.props.accessibilityLabel).toBe('Add item');
      expect(button.props.accessibilityRole).toBe('button');

      await fireEvent.press(button);

      expect(onPress).toHaveBeenCalledTimes(1);
      expect(hapticSpy).toHaveBeenCalledTimes(1);
    });

    it('blocks presses when disabled', async () => {
      const onPress = jest.fn();
      await render(
        <IconButton
          testID="disabled-icon-btn"
          accessibilityLabel="Delete item"
          icon={<Text>-</Text>}
          onPress={onPress}
          disabled
        />
      );

      const button = screen.getByTestId('disabled-icon-btn');
      await fireEvent.press(button);
      expect(onPress).not.toHaveBeenCalled();
      expect(button.props.accessibilityState).toMatchObject({ disabled: true });
    });

    it('enforces MIN_TOUCH_TARGET size of at least 48', async () => {
      await render(
        <IconButton
          testID="small-icon-btn"
          accessibilityLabel="Small button"
          size={24}
          icon={<Text>*</Text>}
          onPress={jest.fn()}
        />
      );

      const button = screen.getByTestId('small-icon-btn');
      const flatStyle = [button.props.style].flat().reduce((acc, s) => ({ ...acc, ...s }), {});
      expect(flatStyle.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
      expect(flatStyle.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    });
  });

  describe('ProgressBar', () => {
    it('safely clamps out-of-range progress values', async () => {
      const { rerender } = await render(<ProgressBar testID="progress-negative" progress={-0.5} />);
      const barNeg = screen.getByTestId('progress-negative');
      expect(barNeg.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 0 });

      await rerender(<ProgressBar testID="progress-overflow" progress={1.8} />);
      const barOver = screen.getByTestId('progress-overflow');
      expect(barOver.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 100 });

      await rerender(<ProgressBar testID="progress-nan" progress={NaN} />);
      const barNaN = screen.getByTestId('progress-nan');
      expect(barNaN.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 0 });
    });

    it('renders normal clamped percentage correctly', async () => {
      await render(<ProgressBar testID="progress-half" progress={0.45} />);
      const bar = screen.getByTestId('progress-half');
      expect(bar.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 45 });

      const indicator = screen.getByTestId('progress-half-indicator');
      const flatStyle = [indicator.props.style].flat().reduce((acc, s) => ({ ...acc, ...s }), {});
      expect(flatStyle.width).toBe('45%');
    });
  });

  describe('ProgressRing', () => {
    it('safely clamps negative and overflow progress without NaN SVG attributes', async () => {
      const { rerender } = await render(<ProgressRing testID="ring-neg" progress={-0.5} />);
      const ringNeg = screen.getByTestId('ring-neg');
      expect(ringNeg.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 0 });

      await rerender(<ProgressRing testID="ring-over" progress={2.5} />);
      const ringOver = screen.getByTestId('ring-over');
      expect(ringOver.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 100 });

      await rerender(<ProgressRing testID="ring-nan" progress={NaN} />);
      const ringNaN = screen.getByTestId('ring-nan');
      expect(ringNaN.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 0 });
    });

    it('renders centered children inside the ring', async () => {
      await render(
        <ProgressRing testID="ring-with-children" progress={0.75}>
          <Text testID="ring-child-text">1,500 kcal</Text>
        </ProgressRing>
      );
      expect(screen.getByTestId('ring-child-text')).toBeTruthy();
    });

    it('supports 360-degree full circle sweep', async () => {
      await render(<ProgressRing testID="ring-360" progress={0.5} arcSweepDegrees={360} />);
      const ring = screen.getByTestId('ring-360');
      expect(ring.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 50 });
    });
  });

  describe('SegmentedControl', () => {
    const options = [
      { label: 'Daily', value: 'daily' },
      { label: 'Weekly', value: 'weekly' },
      { label: 'Monthly', value: 'monthly' },
    ] as const;

    it('renders tabs with selected tab highlighted and fires selection haptic on change', async () => {
      const onSelect = jest.fn();
      const hapticSpy = jest.spyOn(haptics, 'selectionChanged');

      await render(
        <SegmentedControl
          testID="period-segmented"
          options={options}
          selectedValue="daily"
          onSelect={onSelect}
        />
      );

      const dailyTab = screen.getByTestId('period-segmented-daily');
      const weeklyTab = screen.getByTestId('period-segmented-weekly');

      expect(dailyTab.props.accessibilityState).toEqual({ selected: true });
      expect(weeklyTab.props.accessibilityState).toEqual({ selected: false });

      await fireEvent.press(weeklyTab);

      expect(onSelect).toHaveBeenCalledWith('weekly');
      expect(hapticSpy).toHaveBeenCalledTimes(1);
    });

    it('does not re-fire onSelect or haptics when pressing the already selected tab', async () => {
      const onSelect = jest.fn();
      const hapticSpy = jest.spyOn(haptics, 'selectionChanged');

      await render(
        <SegmentedControl
          testID="period-segmented"
          options={options}
          selectedValue="daily"
          onSelect={onSelect}
        />
      );

      const dailyTab = screen.getByTestId('period-segmented-daily');
      await fireEvent.press(dailyTab);

      expect(onSelect).not.toHaveBeenCalled();
      expect(hapticSpy).not.toHaveBeenCalled();
    });
  });

  describe('RulerPicker', () => {
    it('increments and decrements with step precision and triggers haptics', async () => {
      const onValueChange = jest.fn();
      const hapticSpy = jest.spyOn(haptics, 'selectionChanged');

      await render(
        <RulerPicker
          testID="weight-ruler"
          value={70}
          min={40}
          max={150}
          step={0.5}
          unit="kg"
          onValueChange={onValueChange}
        />
      );

      const plusBtn = screen.getByTestId('weight-ruler-step-plus');
      await fireEvent.press(plusBtn);
      expect(onValueChange).toHaveBeenCalledWith(70.5);
      expect(hapticSpy).toHaveBeenCalledTimes(1);

      const minusBtn = screen.getByTestId('weight-ruler-step-minus');
      await fireEvent.press(minusBtn);
      expect(onValueChange).toHaveBeenCalledWith(69.5);
    });

    it('performs quick jump steps (+5 and -5 steps)', async () => {
      const onValueChange = jest.fn();

      await render(
        <RulerPicker
          testID="cal-ruler"
          value={2000}
          min={1000}
          max={4000}
          step={10}
          unit="kcal"
          onValueChange={onValueChange}
        />
      );

      const jumpPlus = screen.getByTestId('cal-ruler-jump-plus');
      await fireEvent.press(jumpPlus);
      expect(onValueChange).toHaveBeenCalledWith(2050);

      const jumpMinus = screen.getByTestId('cal-ruler-jump-minus');
      await fireEvent.press(jumpMinus);
      expect(onValueChange).toHaveBeenCalledWith(1950);
    });

    it('clamps tightly to min and max boundaries', async () => {
      const onValueChange = jest.fn();

      const { rerender } = await render(
        <RulerPicker
          testID="clamped-ruler"
          value={40}
          min={40}
          max={100}
          step={1}
          unit="kg"
          onValueChange={onValueChange}
        />
      );

      const minusBtn = screen.getByTestId('clamped-ruler-step-minus');
      await fireEvent.press(minusBtn);
      expect(onValueChange).not.toHaveBeenCalled();

      await rerender(
        <RulerPicker
          testID="clamped-ruler"
          value={100}
          min={40}
          max={100}
          step={1}
          unit="kg"
          onValueChange={onValueChange}
        />
      );

      const plusBtn = screen.getByTestId('clamped-ruler-step-plus');
      await fireEvent.press(plusBtn);
      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  describe('SkeletonBox', () => {
    it('renders with width, height, and border radius tokens', async () => {
      await render(<SkeletonBox testID="skeleton" width={120} height={24} radius="md" />);
      const skeleton = screen.getByTestId('skeleton');
      const flatStyle = [skeleton.props.style].flat().reduce((acc, s) => ({ ...acc, ...s }), {});
      expect(flatStyle.width).toBe(120);
      expect(flatStyle.height).toBe(24);
      expect(flatStyle.borderRadius).toBe(14); // radii.md
    });
  });

  describe('ErrorBoundary', () => {
    it('catches thrown error, logs to CrashReporter, and resets on Try Again', async () => {
      const crashSpy = jest.spyOn(CrashReporter, 'recordError');
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

      let shouldThrow = true;
      const Thrower: React.FC = () => {
        if (shouldThrow) {
          throw new Error('Test crash in child component');
        }
        return <Text testID="safe-content">All systems nominal</Text>;
      };

      const { rerender } = await render(
        <ErrorBoundary>
          <Thrower />
        </ErrorBoundary>
      );

      expect(crashSpy).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Something went wrong')).toBeTruthy();
      expect(screen.getByText('Test crash in child component')).toBeTruthy();

      // Clear throw flag and trigger Try Again recovery
      shouldThrow = false;
      const retryBtn = screen.getByTestId('error-boundary-retry-button');
      await fireEvent.press(retryBtn);

      await rerender(
        <ErrorBoundary>
          <Thrower />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('safe-content')).toBeTruthy();
      spy.mockRestore();
    });
  });

  describe('EmptyStateView', () => {
    it('renders title, description, and handles optional action button', async () => {
      const onAction = jest.fn();
      await render(
        <EmptyStateView
          testID="empty-view"
          title="No Meals Logged"
          description="You have not logged any food for today yet."
          actionLabel="Log First Meal"
          onAction={onAction}
        />
      );

      expect(screen.getByText('No Meals Logged')).toBeTruthy();
      expect(screen.getByText('You have not logged any food for today yet.')).toBeTruthy();

      const actionBtn = screen.getByTestId('empty-view-action');
      await fireEvent.press(actionBtn);
      expect(onAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('OfflineSyncBanner', () => {
    it('renders null when online and has no pending sync items', async () => {
      const { toJSON } = await render(<OfflineSyncBanner isOffline={false} pendingSyncCount={0} />);
      expect(toJSON()).toBeNull();
    });

    it('renders offline warning banner when offline', async () => {
      await render(
        <OfflineSyncBanner
          testID="offline-banner"
          isOffline={true}
          pendingSyncCount={0}
        />
      );

      expect(screen.getByTestId('offline-banner')).toBeTruthy();
      expect(screen.getByText('You are offline. Showing cached data')).toBeTruthy();
    });

    it('renders pending sync count and triggers onRetrySync', async () => {
      const onRetrySync = jest.fn();
      await render(
        <OfflineSyncBanner
          testID="pending-banner"
          isOffline={false}
          pendingSyncCount={3}
          onRetrySync={onRetrySync}
        />
      );

      expect(screen.getByText('3 changes pending sync')).toBeTruthy();
      const retryBtn = screen.getByTestId('pending-banner-retry');
      await fireEvent.press(retryBtn);
      expect(onRetrySync).toHaveBeenCalledTimes(1);
    });
  });

  describe('ConfirmationDialog', () => {
    it(
      'renders dialog when visible and handles cancel and confirm actions',
      async () => {
      const onConfirm = jest.fn();
      const onCancel = jest.fn();

      await render(
        <ConfirmationDialog
          testID="confirm-dialog"
          visible={true}
          title="Delete Daily Log"
          message="Are you sure you want to permanently delete this log?"
          confirmLabel="Delete"
          cancelLabel="Keep"
          variant="danger"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      expect(screen.getByText('Delete Daily Log')).toBeTruthy();
      expect(screen.getByText('Are you sure you want to permanently delete this log?')).toBeTruthy();

      const cancelBtn = screen.getByTestId('confirm-dialog-cancel');
      await fireEvent.press(cancelBtn);
      expect(onCancel).toHaveBeenCalledTimes(1);

      const confirmBtn = screen.getByTestId('confirm-dialog-confirm');
      await fireEvent.press(confirmBtn);
      expect(onConfirm).toHaveBeenCalledTimes(1);
    }, 15000);

    it('handles backdrop dismissal', async () => {
      const onCancel = jest.fn();
      await render(
        <ConfirmationDialog
          testID="backdrop-dialog"
          visible={true}
          title="Dismiss Test"
          message="Testing backdrop press"
          onConfirm={jest.fn()}
          onCancel={onCancel}
        />
      );

      const backdrop = screen.getByTestId('backdrop-dialog-backdrop');
      await fireEvent.press(backdrop);
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('ToastManager (ToastProvider & useToast)', () => {
    it('throws error when useToast is used outside of ToastProvider', async () => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      await expect(renderHook(() => useToast())).rejects.toThrow(
        'useToast must be used within a ToastProvider'
      );
      spy.mockRestore();
    });

    it('shows toast banner and auto-dismisses after duration', async () => {
      const TestConsumer: React.FC = () => {
        const { showToast, dismissToast } = useToast();
        return (
          <View>
            <AppButton
              testID="show-toast-trigger"
              title="Trigger"
              onPress={() =>
                showToast({
                  message: 'Nutritional targets updated!',
                  variant: 'success',
                  durationMs: 50,
                })
              }
            />
            <AppButton testID="dismiss-toast-trigger" title="Dismiss" onPress={dismissToast} />
          </View>
        );
      };

      await render(
        <ToastProvider>
          <TestConsumer />
        </ToastProvider>
      );

      expect(screen.queryByTestId('toast-banner')).toBeNull();

      // Trigger toast
      await fireEvent.press(screen.getByTestId('show-toast-trigger'));
      expect(screen.getByTestId('toast-banner')).toBeTruthy();
      expect(screen.getByText('Nutritional targets updated!')).toBeTruthy();

      // Wait past durationMs
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 80));
      });

      expect(screen.queryByTestId('toast-banner')).toBeNull();
    });

    it('dismisses toast when banner is tapped', async () => {
      const TestConsumer: React.FC = () => {
        const { showToast } = useToast();
        return (
          <AppButton
            testID="show-toast"
            title="Show"
            onPress={() =>
              showToast({
                message: 'Synced successfully',
                variant: 'info',
                durationMs: 5000,
              })
            }
          />
        );
      };

      await render(
        <ToastProvider>
          <TestConsumer />
        </ToastProvider>
      );

      await fireEvent.press(screen.getByTestId('show-toast'));
      const banner = screen.getByTestId('toast-banner');
      expect(banner).toBeTruthy();

      await fireEvent.press(banner);
      expect(screen.queryByTestId('toast-banner')).toBeNull();
    });
  });
});
