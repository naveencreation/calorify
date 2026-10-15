export type AppErrorCode =
  | 'AUTH_REQUIRES_RECENT_LOGIN'
  | 'AUTH_INVALID_CREDENTIALS'
  | 'AUTH_EMAIL_IN_USE'
  | 'NETWORK_ERROR'
  | 'AI_INVALID_KEY'
  | 'AI_MISSING_KEY'
  | 'AI_RATE_LIMITED'
  | 'AI_QUOTA_EXCEEDED'
  | 'AI_MODEL_NOT_FOUND'
  | 'AI_INVALID_RESPONSE'
  | 'STORAGE_ERROR'
  | 'PERMISSION_DENIED'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN_ERROR';

export interface AppErrorOptions {
  code: AppErrorCode;
  message: string;
  userMessage?: string;
  isRetryable?: boolean;
  statusCode?: number;
  cause?: unknown;
}

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly userMessage: string;
  readonly isRetryable: boolean;
  readonly statusCode?: number;
  readonly cause?: unknown;

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = 'AppError';
    this.code = options.code;
    this.userMessage = options.userMessage ?? options.message;
    this.isRetryable = options.isRetryable ?? false;
    this.statusCode = options.statusCode;
    this.cause = options.cause;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
