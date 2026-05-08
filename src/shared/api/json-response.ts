import { ApiError } from './api-error';

type ParseJsonResponseOptions = {
  invalidJsonMessage: string;
};

export async function parseJsonResponse<TResponse>(
  response: Response,
  { invalidJsonMessage }: ParseJsonResponseOptions
): Promise<TResponse> {
  const text = await response.text();

  if (!text) {
    return null as TResponse;
  }

  try {
    return JSON.parse(text) as TResponse;
  } catch (error) {
    throw new ApiError(invalidJsonMessage, {
      cause: error,
      code: 'INVALID_JSON_RESPONSE',
      retryable: false,
      status: response.status,
    });
  }
}
