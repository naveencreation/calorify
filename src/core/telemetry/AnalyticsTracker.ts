import { getAnalytics } from '@react-native-firebase/analytics';
import { Platform } from 'react-native';

export class AnalyticsTracker {
  /**
   * Tracks a privacy-safe telemetry event.
   */
  static async trackEvent(
    eventName: string,
    params?: Record<string, unknown>
  ): Promise<void> {
    try {
      if (Platform.OS === 'web') return;
      await getAnalytics().logEvent(eventName, params);
    } catch {
      // Gracefully silent
    }
  }

  /**
   * Sets the user UID for analytics tracking.
   */
  static async setUserId(userId: string | null): Promise<void> {
    try {
      if (Platform.OS === 'web') return;
      await getAnalytics().setUserId(userId);
    } catch {
      // Gracefully silent
    }
  }
}
