import { AppError, AppErrorCode } from './AppError';

interface ErrorWithPotentialFields {
  code?: unknown;
  status?: unknown;
  statusCode?: unknown;
  message?: unknown;
  cause?: unknown;
}

export const mapToAppError = (
  error: unknown,
  fallbackMessage = 'An unexpected error occurred. Please try again.'
): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  const errObj = (typeof error === 'object' && error !== null ? error : {}) as ErrorWithPotentialFields;
  const rawCode = typeof errObj.code === 'string' ? errObj.code : undefined;
  const rawStatus = typeof errObj.status === 'number'
    ? errObj.status
    : typeof errObj.statusCode === 'number'
      ? errObj.statusCode
      : undefined;
  const rawMessage = typeof errObj.message === 'string'
    ? errObj.message
    : typeof error === 'string'
      ? error
      : fallbackMessage;

  // 1. Firebase Auth specific codes
  if (rawCode === 'auth/requires-recent-login') {
    return new AppError({
      code: 'AUTH_REQUIRES_RECENT_LOGIN',
      message: rawMessage,
      userMessage: 'Please re-authenticate to confirm this sensitive action.',
      isRetryable: false,
      cause: error,
    });
  }

  if (
    rawCode === 'auth/invalid-credential' ||
    rawCode === 'auth/wrong-password' ||
    rawCode === 'auth/user-not-found' ||
    rawCode === 'auth/invalid-email'
  ) {
    return new AppError({
      code: 'AUTH_INVALID_CREDENTIALS',
      message: rawMessage,
      userMessage: 'Invalid email or password. Please verify and try again.',
      isRetryable: false,
      cause: error,
    });
  }

  if (rawCode === 'auth/email-already-in-use') {
    return new AppError({
      code: 'AUTH_EMAIL_IN_USE',
      message: rawMessage,
      userMessage: 'An account with this email already exists. Please log in.',
      isRetryable: false,
      cause: error,
    });
  }

  if (rawCode === 'auth/network-request-failed') {
    return new AppError({
      code: 'NETWORK_ERROR',
      message: rawMessage,
      userMessage: 'Network error. Please check your internet connection.',
      isRetryable: true,
      cause: error,
    });
  }

  // 2. HTTP Status Code Mapping
  if (rawStatus === 400) {
    return new AppError({
      code: 'VALIDATION_ERROR',
      message: rawMessage,
      userMessage: 'Invalid request format or input data.',
      statusCode: 400,
      isRetryable: false,
      cause: error,
    });
  }

  if (rawStatus === 401) {
    return new AppError({
      code: 'AI_INVALID_KEY',
      message: rawMessage,
      userMessage: 'Invalid API key. Please check your Gemini API key in settings.',
      statusCode: 401,
      isRetryable: false,
      cause: error,
    });
  }

  if (rawStatus === 403) {
    return new AppError({
      code: 'PERMISSION_DENIED',
      message: rawMessage,
      userMessage: 'You do not have permission to access this resource.',
      statusCode: 403,
      isRetryable: false,
      cause: error,
    });
  }

  if (rawStatus === 404) {
    return new AppError({
      code: 'AI_MODEL_NOT_FOUND',
      message: rawMessage,
      userMessage: 'The requested AI model could not be found.',
      statusCode: 404,
      isRetryable: false,
      cause: error,
    });
  }

  if (rawStatus === 429) {
    return new AppError({
      code: 'AI_RATE_LIMITED',
      message: rawMessage,
      userMessage: 'Rate limit reached. Please wait a moment before trying again.',
      statusCode: 429,
      isRetryable: true,
      cause: error,
    });
  }

  if (rawStatus && rawStatus >= 500) {
    return new AppError({
      code: 'NETWORK_ERROR',
      message: rawMessage,
      userMessage: 'Remote service unavailable. Please retry shortly.',
      statusCode: rawStatus,
      isRetryable: true,
      cause: error,
    });
  }

  // 3. String heuristics
  const lowerMessage = rawMessage.toLowerCase();
  if (lowerMessage.includes('quota') || lowerMessage.includes('resource_exhausted')) {
    return new AppError({
      code: 'AI_QUOTA_EXCEEDED',
      message: rawMessage,
      userMessage: 'AI scan quota exceeded. Please try again tomorrow or use your own key.',
      isRetryable: false,
      cause: error,
    });
  }

  if (
    lowerMessage.includes('network request failed') ||
    lowerMessage.includes('failed to fetch') ||
    lowerMessage.includes('offline')
  ) {
    return new AppError({
      code: 'NETWORK_ERROR',
      message: rawMessage,
      userMessage: 'Network unavailable. Changes will sync once back online.',
      isRetryable: true,
      cause: error,
    });
  }

  let code: AppErrorCode = 'UNKNOWN_ERROR';
  if (lowerMessage.includes('storage') || lowerMessage.includes('asyncstorage')) {
    code = 'STORAGE_ERROR';
  } else if (lowerMessage.includes('permission')) {
    code = 'PERMISSION_DENIED';
  }

  return new AppError({
    code,
    message: rawMessage,
    userMessage: fallbackMessage,
    isRetryable: false,
    cause: error,
  });
};
