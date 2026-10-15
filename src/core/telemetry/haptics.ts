import * as Haptics from 'expo-haptics';

export const impactLight = async (): Promise<void> => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Silently ignore on unsupported hardware/web
  }
};

export const impactMedium = async (): Promise<void> => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
    // Silently ignore on unsupported hardware/web
  }
};

export const notificationSuccess = async (): Promise<void> => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Silently ignore on unsupported hardware/web
  }
};

export const notificationWarning = async (): Promise<void> => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch {
    // Silently ignore on unsupported hardware/web
  }
};

export const selectionChanged = async (): Promise<void> => {
  try {
    await Haptics.selectionAsync();
  } catch {
    // Silently ignore on unsupported hardware/web
  }
};

export const haptics = {
  impactLight,
  impactMedium,
  notificationSuccess,
  notificationWarning,
  selectionChanged,
};
