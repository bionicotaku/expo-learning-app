export type ApiErrorCode =
  | 'API_BASE_URL_MISSING'
  | 'AUTH_TOKEN_MISSING'
  | 'HTTP_ERROR'
  | 'NETWORK_ERROR'
  | 'REQUEST_ABORTED'
  | 'TIMEOUT';

type ApiErrorOptions = {
  status?: number;
  code?: ApiErrorCode | string;
  retryable?: boolean;
  cause?: unknown;
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode | string;
  readonly retryable: boolean;

  constructor(message: string, options: ApiErrorOptions = {}) {
    super(message, {
      cause: options.cause,
    });

    this.name = 'ApiError';
    this.status = options.status ?? 0;
    this.code = options.code ?? 'NETWORK_ERROR';
    this.retryable = options.retryable ?? false;
  }
}
