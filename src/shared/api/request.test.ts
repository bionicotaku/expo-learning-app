import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearApiTokenGetter,
  DEFAULT_API_REQUEST_TIMEOUT_MS,
  registerApiTokenGetter,
  requestJson,
} from './index';

describe('requestJson', () => {
  const originalBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  beforeEach(() => {
    process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.example.com';
  });

  afterEach(() => {
    clearApiTokenGetter();
    vi.unstubAllGlobals();
    vi.useRealTimers();

    if (originalBaseUrl) {
      process.env.EXPO_PUBLIC_API_BASE_URL = originalBaseUrl;
      return;
    }

    delete process.env.EXPO_PUBLIC_API_BASE_URL;
  });

  it('builds the request URL with serialized query params', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );

    vi.stubGlobal('fetch', fetchMock);

    await expect(
      requestJson<{ ok: boolean }>({
        path: '/videos',
        query: {
          cursor: 10,
          filter: 'saved',
          muted: false,
        },
      })
    ).resolves.toEqual({ ok: true });

    const [input] = fetchMock.mock.calls[0] as [RequestInfo | URL];
    const url = new URL(String(input));

    expect(url.origin).toBe('https://api.example.com');
    expect(url.pathname).toBe('/videos');
    expect(url.searchParams.get('cursor')).toBe('10');
    expect(url.searchParams.get('filter')).toBe('saved');
    expect(url.searchParams.get('muted')).toBe('false');
  });

  it('returns null for a 204 response', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 204 }));

    vi.stubGlobal('fetch', fetchMock);

    await expect(
      requestJson<null>({
        path: '/favorites/video-1',
        method: 'DELETE',
      })
    ).resolves.toBeNull();
  });

  it('merges JSON and auth headers with custom headers', async () => {
    registerApiTokenGetter(async () => 'token-123');

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );

    vi.stubGlobal('fetch', fetchMock);

    await requestJson<{ ok: boolean }, { enabled: boolean }>({
      path: '/settings',
      method: 'POST',
      auth: 'optional',
      headers: {
        'X-Trace': 'trace-1',
      },
      body: {
        enabled: true,
      },
    });

    const [, init] = fetchMock.mock.calls[0] as [RequestInfo | URL, RequestInit];

    expect(init.method).toBe('POST');
    expect(init.headers).toMatchObject({
      Accept: 'application/json',
      Authorization: 'Bearer token-123',
      'Content-Type': 'application/json',
      'X-Trace': 'trace-1',
    });
    expect(init.body).toBe(JSON.stringify({ enabled: true }));
  });

  it('lets custom headers override default JSON headers', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    await requestJson<{ ok: boolean }, { enabled: boolean }>({
      path: '/settings',
      method: 'POST',
      headers: {
        Accept: 'application/problem+json',
        'Content-Type': 'application/vnd.api+json',
      },
      body: {
        enabled: true,
      },
    });

    const [, init] = fetchMock.mock.calls[0] as [RequestInfo | URL, RequestInit];
    expect(init.headers).toMatchObject({
      Accept: 'application/problem+json',
      'Content-Type': 'application/vnd.api+json',
    });
  });

  it('throws ApiError with server details for non-retryable 4xx responses', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          code: 'NOT_FOUND',
          details: {
            videoId: 'missing',
          },
          message: 'Missing',
          request_id: 'req-123',
        }),
        {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
        }
      )
    );

    vi.stubGlobal('fetch', fetchMock);

    await expect(
      requestJson({
        path: '/videos/missing',
      })
    ).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      code: 'NOT_FOUND',
      details: {
        videoId: 'missing',
      },
      message: 'Missing',
      requestId: 'req-123',
      retryable: false,
    });
  });

  it.each([408, 429, 500])('marks HTTP %s responses as retryable', async (status) => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ code: 'TEMPORARY_FAILURE' }), {
          status,
        })
      )
    );

    await expect(
      requestJson({
        path: '/unstable',
      })
    ).rejects.toMatchObject({
      code: 'TEMPORARY_FAILURE',
      retryable: true,
      status,
    });
  });

  it.each([400, 401, 403, 404, 409, 422])(
    'marks HTTP %s responses as non-retryable',
    async (status) => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          new Response(JSON.stringify({ code: 'REQUEST_FAILED' }), {
            status,
          })
        )
      );

      await expect(
        requestJson({
          path: '/invalid',
        })
      ).rejects.toMatchObject({
        code: 'REQUEST_FAILED',
        retryable: false,
        status,
      });
    }
  );

  it('preserves camelCase requestId from an error response body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ requestId: 'req-camel' }), {
          status: 500,
        })
      )
    );

    await expect(
      requestJson({
        path: '/server-error',
      })
    ).rejects.toMatchObject({
      requestId: 'req-camel',
      retryable: true,
    });
  });

  it('keeps the HTTP failure when the error response body is invalid JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{', { status: 500 })));

    await expect(
      requestJson({
        path: '/bad-error-body',
      })
    ).rejects.toMatchObject({
      code: 'HTTP_ERROR',
      message: 'Request failed',
      retryable: true,
      status: 500,
    });
  });

  it('throws a retryable timeout error after the default timeout', async () => {
    vi.useFakeTimers();

    const fetchMock = vi.fn((_: RequestInfo | URL, init?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'));
        });
      });
    });

    vi.stubGlobal('fetch', fetchMock);

    const request = requestJson({
      path: '/default-slow',
    });
    const expectation = expect(request).rejects.toMatchObject({
      name: 'ApiError',
      code: 'TIMEOUT',
      retryable: true,
    });

    await vi.advanceTimersByTimeAsync(DEFAULT_API_REQUEST_TIMEOUT_MS);

    await expectation;
  });

  it('throws a retryable timeout error when the request exceeds timeoutMs', async () => {
    vi.useFakeTimers();

    const fetchMock = vi.fn((_: RequestInfo | URL, init?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'));
        });
      });
    });

    vi.stubGlobal('fetch', fetchMock);

    const request = requestJson({
      path: '/slow',
      timeoutMs: 100,
    });
    const expectation = expect(request).rejects.toMatchObject({
      name: 'ApiError',
      code: 'TIMEOUT',
      retryable: true,
    });

    await vi.advanceTimersByTimeAsync(100);

    await expectation;
  });

  it('throws a non-retryable abort error when the external signal aborts', async () => {
    const controller = new AbortController();
    const fetchMock = vi.fn((_: RequestInfo | URL, init?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'));
        });
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const request = requestJson({
      path: '/abort',
      signal: controller.signal,
    });
    controller.abort();

    await expect(request).rejects.toMatchObject({
      code: 'REQUEST_ABORTED',
      name: 'ApiError',
      retryable: false,
    });
  });

  it('treats plain AbortError objects as abort errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue({
        name: 'AbortError',
      })
    );

    await expect(
      requestJson({
        path: '/plain-abort',
      })
    ).rejects.toMatchObject({
      code: 'REQUEST_ABORTED',
      retryable: false,
    });
  });

  it('throws a non-retryable invalid JSON response error for 2xx bad JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{', { status: 200 })));

    await expect(
      requestJson({
        path: '/bad-json',
      })
    ).rejects.toMatchObject({
      code: 'INVALID_JSON_RESPONSE',
      name: 'ApiError',
      retryable: false,
      status: 200,
    });
  });

  it('fails before dispatch when auth is required and no token exists', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      requestJson({
        path: '/protected',
        auth: 'required',
      })
    ).rejects.toMatchObject({
      name: 'ApiError',
      code: 'AUTH_TOKEN_MISSING',
      retryable: false,
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
