import { ApiError } from './api-error';
import { parseJsonResponse } from './json-response';
import { createRequestAbortController, isAbortError } from './request-abort-controller';
import { getRegisteredApiToken } from './token-registry';

export const DEFAULT_API_REQUEST_TIMEOUT_MS = 10_000;

export type RequestAuthMode = 'none' | 'optional' | 'required';
type QueryValue = string | number | boolean | null | undefined;
type QueryRecord = Record<string, QueryValue | QueryValue[]>;

type ApiErrorResponseBody = {
  message?: string;
  code?: string;
  details?: unknown;
  request_id?: string;
  requestId?: string;
};

export type RequestJsonOptions<TBody = unknown> = {
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  query?: QueryRecord;
  body?: TBody;
  headers?: Record<string, string>;
  auth?: RequestAuthMode;
  timeoutMs?: number;
  signal?: AbortSignal;
};

function normalizePath(path: string) {
  return path.startsWith('/') ? path.slice(1) : path;
}

function buildApiUrl(path: string, query?: QueryRecord) {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    throw new ApiError('EXPO_PUBLIC_API_BASE_URL is not configured', {
      code: 'API_BASE_URL_MISSING',
      retryable: false,
    });
  }

  const url = new URL(normalizePath(path), baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);

  if (!query) {
    return url;
  }

  for (const [key, rawValue] of Object.entries(query)) {
    if (Array.isArray(rawValue)) {
      rawValue.forEach((value) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
      continue;
    }

    if (rawValue !== undefined && rawValue !== null) {
      url.searchParams.set(key, String(rawValue));
    }
  }

  return url;
}

function isRetryableHttpStatus(status: number) {
  return status === 408 || status === 429 || status >= 500;
}

export async function requestJson<TResponse, TBody = unknown>({
  path,
  method = 'GET',
  query,
  body,
  headers,
  auth = 'none',
  timeoutMs = DEFAULT_API_REQUEST_TIMEOUT_MS,
  signal,
}: RequestJsonOptions<TBody>): Promise<TResponse> {
  const url = buildApiUrl(path, query);
  const abortController = createRequestAbortController({
    signal,
    timeoutMs,
  });

  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    ...headers,
  };

  try {
    if (auth !== 'none') {
      const token = await getRegisteredApiToken();

      if (!token && auth === 'required') {
        throw new ApiError('Authentication token is required for this request', {
          code: 'AUTH_TOKEN_MISSING',
          retryable: false,
        });
      }

      if (token) {
        requestHeaders.Authorization = `Bearer ${token}`;
      }
    }

    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: abortController.signal,
    });

    if (response.status === 204) {
      return null as TResponse;
    }

    if (!response.ok) {
      const errorBody = await parseJsonResponse<ApiErrorResponseBody | null>(response, {
        invalidJsonMessage: 'Error response payload was not valid JSON',
      }).catch(() => null);

      throw new ApiError(errorBody?.message ?? 'Request failed', {
        status: response.status,
        code: errorBody?.code ?? 'HTTP_ERROR',
        retryable: isRetryableHttpStatus(response.status),
        details: errorBody?.details,
        requestId: errorBody?.request_id ?? errorBody?.requestId,
      });
    }

    return parseJsonResponse<TResponse>(response, {
      invalidJsonMessage: 'Response payload was not valid JSON',
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (isAbortError(error)) {
      if (abortController.getAbortReason() === 'timeout') {
        throw new ApiError('Request timed out', {
          code: 'TIMEOUT',
          retryable: true,
          cause: error,
        });
      }

      throw new ApiError('Request was aborted', {
        code: 'REQUEST_ABORTED',
        retryable: false,
        cause: error,
      });
    }

    throw new ApiError('Network request failed', {
      code: 'NETWORK_ERROR',
      retryable: true,
      cause: error,
    });
  } finally {
    abortController.cleanup();
  }
}
