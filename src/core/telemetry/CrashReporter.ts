import { getCrashlytics } from '@react-native-firebase/crashlytics';
import { Platform } from 'react-native';

export class CrashReporter {
  /**
   * Redacts sensitive strings matching Google API keys (AIza...) before logging.
   */
  static redactSensitive(text: string): string {
    if (!text || typeof text !== 'string') return text;
    return text.replace(/AIza[0-9A-Za-z-_]{20,}/g, '[REDACTED_API_KEY]');
  }

  /**
   * Logs an error to Crashlytics safely, ensuring sensitive API keys are scrubbed.
   */
  static recordError(error: unknown, context?: string, extra?: Record<string, unknown>): void {
    try {
      if (Platform.OS === 'web') return;

      const rawMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : 'Unknown error';

      const sanitizedMessage = this.redactSensitive(rawMessage);
      const sanitizedError = new Error(
        context ? `[${context}] ${sanitizedMessage}` : sanitizedMessage
      );

      if (error instanceof Error) {
        sanitizedError.name = error.name;
        if (error.stack) {
          sanitizedError.stack = this.redactSensitive(error.stack);
        }
      }

      if (extra) {
        try {
          getCrashlytics().log(`Context details: ${JSON.stringify(extra)}`);
        } catch {
          // Ignore logging failure
        }
      }

      getCrashlytics().recordError(sanitizedError);
    } catch {
      // Gracefully silent in environments without native binary
    }
  }

  /**
   * Associates crash reports with a user UID.
   */
  static setUserId(userId: string): void {
    try {
      if (Platform.OS === 'web') return;
      getCrashlytics().setUserId(userId);
    } catch {
      // Gracefully silent
    }
  }
}
