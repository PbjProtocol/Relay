/** Structured Relay error metadata. */
export interface RelayErrorOptions {
  code: string;
  statusCode?: number | undefined;
  requestId?: string | undefined;
  retryable?: boolean | undefined;
  cause?: unknown;
  details?: Record<string, unknown> | undefined;
}
/** Base class for all SDK errors. */
export class RelayError extends Error {
  readonly code: string;
  readonly statusCode?: number;
  readonly requestId?: string;
  readonly retryable: boolean;
  override readonly cause?: unknown;
  readonly details?: Record<string, unknown>;
  /** Creates a typed SDK error. */
  constructor(message: string, options: RelayErrorOptions) {
    super(message);
    this.name = new.target.name;
    this.code = options.code;
    this.retryable = options.retryable ?? false;
    if (options.statusCode !== undefined) this.statusCode = options.statusCode;
    if (options.requestId !== undefined) this.requestId = options.requestId;
    if (options.cause !== undefined) this.cause = options.cause;
    if (options.details !== undefined) this.details = options.details;
  }
}
/** HTTP API failure. */ export class RelayApiError extends RelayError {}
/** Invalid or missing credentials. */ export class RelayAuthenticationError extends RelayApiError {}
/** Invalid caller input. */ export class RelayValidationError extends RelayError {}
/** API rate limit response. */ export class RelayRateLimitError extends RelayApiError {
  readonly retryAfterMs?: number;
  /** Creates a rate-limit error. */ constructor(
    message: string,
    options: RelayErrorOptions,
    retryAfterMs?: number,
  ) {
    super(message, options);
    if (retryAfterMs !== undefined) this.retryAfterMs = retryAfterMs;
  }
}
/** Resource state conflict. */ export class RelayConflictError extends RelayApiError {}
/** Missing resource. */ export class RelayNotFoundError extends RelayApiError {}
/** Transport failure. */ export class RelayNetworkError extends RelayError {}
/** Blockchain transaction failure. */ export class RelayTransactionError extends RelayError {
  readonly signature?: string;
  /** Creates a transaction error. */ constructor(
    message: string,
    options: RelayErrorOptions,
    signature?: string,
  ) {
    super(message, options);
    if (signature !== undefined) this.signature = signature;
  }
}
/** Request deadline exceeded. */ export class RelayTimeoutError extends RelayNetworkError {}
