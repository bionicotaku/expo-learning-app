import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchJsonResource } from './fetch-json-resource';

const resourceUrl = 'https://cdn.example.com/transcripts/video-1.json';

describe('fetchJsonResource', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('fetches JSON from a complete resource URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchJsonResource(resourceUrl)).resolves.toEqual({ ok: true });

    const [input, init] = fetchMock.mock.calls[0] as [RequestInfo | URL, RequestInit];
    expect(String(input)).toBe(resourceUrl);
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it('throws a retryable timeout error when the resource request exceeds timeoutMs', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn((_: RequestInfo | URL, init?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'));
        });
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const request = fetchJsonResource(resourceUrl, { timeoutMs: 100 });
    const expectation = expect(request).rejects.toMatchObject({
      code: 'TIMEOUT',
      name: 'ApiError',
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

    const request = fetchJsonResource(resourceUrl, {
      signal: controller.signal,
      timeoutMs: 1_000,
    });
    controller.abort();

    await expect(request).rejects.toMatchObject({
      code: 'REQUEST_ABORTED',
      name: 'ApiError',
      retryable: false,
    });
  });

  it('throws a retryable network error when fetch rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    await expect(fetchJsonResource(resourceUrl)).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
      name: 'ApiError',
      retryable: true,
    });
  });

  it('marks HTTP 4xx as non-retryable and HTTP 5xx as retryable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('missing', { status: 404 })));

    await expect(fetchJsonResource(resourceUrl, { failureCode: 'ASSET_FAILED' })).rejects.toMatchObject(
      {
        code: 'ASSET_FAILED',
        retryable: false,
        status: 404,
      }
    );

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('server error', { status: 500 })));

    await expect(fetchJsonResource(resourceUrl, { failureCode: 'ASSET_FAILED' })).rejects.toMatchObject(
      {
        code: 'ASSET_FAILED',
        retryable: true,
        status: 500,
      }
    );
  });

  it('throws a non-retryable invalid JSON response error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{', { status: 200 })));

    await expect(fetchJsonResource(resourceUrl)).rejects.toMatchObject({
      code: 'INVALID_JSON_RESPONSE',
      name: 'ApiError',
      retryable: false,
      status: 200,
    });
  });

  it('cleans up timeout and external abort listeners when the request settles', async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const addSpy = vi.spyOn(controller.signal, 'addEventListener');
    const removeSpy = vi.spyOn(controller.signal, 'removeEventListener');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
        })
      )
    );

    await expect(
      fetchJsonResource(resourceUrl, {
        signal: controller.signal,
        timeoutMs: 1_000,
      })
    ).resolves.toEqual({ ok: true });

    expect(addSpy).toHaveBeenCalledWith('abort', expect.any(Function), { once: true });
    expect(removeSpy).toHaveBeenCalledWith('abort', expect.any(Function));
    expect(vi.getTimerCount()).toBe(0);
  });
});
