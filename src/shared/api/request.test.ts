import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearApiTokenGetter,
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
      Authorization: 'Bearer token-123',
      'Content-Type': 'application/json',
      'X-Trace': 'trace-1',
    });
    expect(init.body).toBe(JSON.stringify({ enabled: true }));
  });

  it('throws ApiError for non-2xx responses', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: 'Missing', code: 'NOT_FOUND' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      })
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
      message: 'Missing',
      retryable: false,
    });
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
