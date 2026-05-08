import { ApiError } from './api-error';
import { parseJsonResponse } from './json-response';
import { createRequestAbortController, isAbortError } from './request-abort-controller';

export const DEFAULT_JSON_RESOURCE_TIMEOUT_MS = 10_000;

export type FetchJsonResourceOptions = {
  signal?: AbortSignal;
  timeoutMs?: number;
  failureCode?: string;
};

export async function fetchJsonResource<TResponse>(
  url: string,
  {
    signal,
    timeoutMs = DEFAULT_JSON_RESOURCE_TIMEOUT_MS,
    failureCode = 'HTTP_ERROR',
  }: FetchJsonResourceOptions = {}
): Promise<TResponse> {
  const abortController = createRequestAbortController({
    signal,
    timeoutMs,
  });

  try {
    const response = await fetch(url, {
      signal: abortController.signal,
    });

    if (!response.ok) {
      throw new ApiError(`Failed to fetch JSON resource ${url}`, {
        code: failureCode,
        retryable: response.status >= 500,
        status: response.status,
      });
    }

    return await parseJsonResponse<TResponse>(response, {
      invalidJsonMessage: `JSON resource payload was not valid JSON for ${url}`,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (isAbortError(error)) {
      if (abortController.getAbortReason() === 'timeout') {
        throw new ApiError('Request timed out', {
          cause: error,
          code: 'TIMEOUT',
          retryable: true,
        });
      }

      throw new ApiError('Request was aborted', {
        cause: error,
        code: 'REQUEST_ABORTED',
        retryable: false,
      });
    }

    throw new ApiError('Network request failed', {
      cause: error,
      code: 'NETWORK_ERROR',
      retryable: true,
    });
  } finally {
    abortController.cleanup();
  }
}
