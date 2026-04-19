import { ApiError } from './api-error';
import { getRegisteredApiToken } from './token-registry';

export type RequestAuthMode = 'none' | 'optional' | 'required';
type QueryValue = string | number | boolean | null | undefined;
type QueryRecord = Record<string, QueryValue | QueryValue[]>;

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

async function parseJsonBody<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text) {
    return null as T;
  }

  return JSON.parse(text) as T;
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError';
}

export async function requestJson<TResponse, TBody = unknown>({
  path,
  method = 'GET',
  query,
  body,
  headers,
  auth = 'none',
  timeoutMs,
  signal,
}: RequestJsonOptions<TBody>): Promise<TResponse> {
  const url = buildApiUrl(path, query);
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let didTimeout = false;

  if (signal) {
    if (signal.aborted) {
      controller.abort(signal.reason);
    } else {
      signal.addEventListener(
        'abort',
        () => {
          controller.abort(signal.reason);
        },
        { once: true }
      );
    }
  }

  if (timeoutMs !== undefined) {
    timeoutId = setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, timeoutMs);
  }

  const requestHeaders: Record<string, string> = {
    ...headers,
  };

  try {
    if (body !== undefined) {
      requestHeaders['Content-Type'] = 'application/json';
    }

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
      signal: controller.signal,
    });

    if (response.status === 204) {
      return null as TResponse;
    }

    if (!response.ok) {
      const errorBody = await parseJsonBody<{ message?: string; code?: string }>(response).catch(
        () => null
      );

      throw new ApiError(errorBody?.message ?? 'Request failed', {
        status: response.status,
        code: errorBody?.code ?? 'HTTP_ERROR',
        retryable: false,
      });
    }

    return parseJsonBody<TResponse>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (isAbortError(error)) {
      if (didTimeout) {
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
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}
