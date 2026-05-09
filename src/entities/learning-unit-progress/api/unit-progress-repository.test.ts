import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearApiTokenGetter,
  registerApiTokenGetter,
} from '@/shared/api';

import {
  fetchLearnedUnitProgressPage,
  fetchUnlearnedUnitProgressPage,
} from './unit-progress-repository';

function createProgressResponse() {
  return {
    items: [
      {
        coarse_unit_id: 101,
        kind: 'word',
        label: 'abandon',
        pos: 'verb',
        chinese_label: '放弃；抛弃',
        chinese_def: '表示放弃某事物、抛弃某人或中止某计划。',
        progress_percent: 64.25,
        last_reviewed_at: '2026-05-08T09:20:00Z',
      },
    ],
    page: {
      limit: 50,
      has_more: true,
      next_cursor: 'opaque-token',
    },
  };
}

function stubProgressFetch() {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(createProgressResponse()), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  );

  vi.stubGlobal('fetch', fetchMock);

  return fetchMock;
}

describe('learning unit progress repository', () => {
  const originalBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  beforeEach(() => {
    process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.example.com';
    registerApiTokenGetter(async () => 'token-123');
  });

  afterEach(() => {
    clearApiTokenGetter();
    vi.unstubAllGlobals();

    if (originalBaseUrl) {
      process.env.EXPO_PUBLIC_API_BASE_URL = originalBaseUrl;
      return;
    }

    delete process.env.EXPO_PUBLIC_API_BASE_URL;
  });

  it('requests the unmastered endpoint for unlearned unit progress', async () => {
    const fetchMock = stubProgressFetch();

    await expect(fetchUnlearnedUnitProgressPage()).resolves.toMatchObject({
      items: [
        {
          coarseUnitId: 101,
          label: 'abandon',
          partOfSpeech: 'verb',
        },
      ],
      page: {
        hasMore: true,
        nextCursor: 'opaque-token',
      },
    });

    const [input, init] = fetchMock.mock.calls[0] as [RequestInfo | URL, RequestInit];
    const url = new URL(String(input));

    expect(url.origin).toBe('https://api.example.com');
    expect(url.pathname).toBe('/learning/unit-progress/unmastered');
    expect(url.searchParams.get('limit')).toBe('50');
    expect(url.searchParams.has('cursor')).toBe(false);
    expect(init.method).toBe('GET');
    expect(init.headers).toMatchObject({
      Accept: 'application/json',
      Authorization: 'Bearer token-123',
    });
  });

  it('requests the mastered endpoint for learned unit progress', async () => {
    const fetchMock = stubProgressFetch();

    await expect(fetchLearnedUnitProgressPage()).resolves.toMatchObject({
      page: {
        limit: 50,
      },
    });

    const [input] = fetchMock.mock.calls[0] as [RequestInfo | URL];
    const url = new URL(String(input));

    expect(url.pathname).toBe('/learning/unit-progress/mastered');
  });

  it('serializes limit and opaque cursor query params', async () => {
    const fetchMock = stubProgressFetch();

    await fetchUnlearnedUnitProgressPage({
      limit: 25,
      cursor: 'cursor-token',
    });

    const [input] = fetchMock.mock.calls[0] as [RequestInfo | URL];
    const url = new URL(String(input));

    expect(url.searchParams.get('limit')).toBe('25');
    expect(url.searchParams.get('cursor')).toBe('cursor-token');
  });

  it('omits an empty cursor from the query params', async () => {
    const fetchMock = stubProgressFetch();

    await fetchLearnedUnitProgressPage({
      cursor: '',
    });

    const [input] = fetchMock.mock.calls[0] as [RequestInfo | URL];
    const url = new URL(String(input));

    expect(url.searchParams.has('cursor')).toBe(false);
  });

  it('fails before dispatch when auth token is missing', async () => {
    clearApiTokenGetter();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchUnlearnedUnitProgressPage()).rejects.toMatchObject({
      name: 'ApiError',
      code: 'AUTH_TOKEN_MISSING',
      retryable: false,
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([0, -1, 101, 1.5, Number.NaN])(
    'fails before dispatch for invalid limit %s',
    async (limit) => {
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);

      await expect(fetchUnlearnedUnitProgressPage({ limit })).rejects.toMatchObject({
        name: 'ApiError',
        code: 'LEARNING_UNIT_PROGRESS_INVALID_LIMIT',
        retryable: false,
      });

      expect(fetchMock).not.toHaveBeenCalled();
    }
  );
});
