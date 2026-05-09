import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { toast } from '@/shared/lib/toast';

import { UNLEARNED_WORD_LIST_QUERY_KEY } from './word-list-query';
import { useUnlearnedWordListSource } from './use-unlearned-word-list-source';

const { fetchMockUnlearnedUnitProgressPageMock } = vi.hoisted(() => ({
  fetchMockUnlearnedUnitProgressPageMock: vi.fn(),
}));

vi.mock('@/entities/learning-unit-progress/api/mock-unit-progress-repository', () => ({
  fetchMockUnlearnedUnitProgressPage: fetchMockUnlearnedUnitProgressPageMock,
}));

type UseUnlearnedWordListSourceResult = ReturnType<typeof useUnlearnedWordListSource>;

let latestResult: UseUnlearnedWordListSourceResult | null = null;

function createPage({
  cursor,
  ids,
  nextCursor,
}: {
  cursor?: string | null;
  ids: number[];
  nextCursor: string;
}) {
  return {
    items: ids.map((id, index) => ({
      coarseUnitId: id,
      kind: 'word',
      label: `word ${id}`,
      partOfSpeech: index % 2 === 0 ? 'noun' : null,
      chineseLabel: id === 2 ? null : id === 3 ? '' : `意思 ${id}`,
      chineseDefinition: `释义 ${id}`,
      progressPercent: 10 + id,
      lastReviewedAt: null,
    })),
    page: {
      limit: ids.length,
      hasMore: true,
      nextCursor,
    },
    cursor,
  };
}

function createDeferredPage(page: ReturnType<typeof createPage>) {
  let resolve!: () => void;
  const promise = new Promise<typeof page>((resolvePromise) => {
    resolve = () => {
      resolvePromise(page);
    };
  });

  return {
    promise,
    resolve,
  };
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

function Harness() {
  latestResult = useUnlearnedWordListSource();
  return null;
}

async function flushWork() {
  await act(async () => {
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

async function waitForAssertion(assertion: () => void) {
  let lastError: unknown;

  for (let attempt = 0; attempt < 10; attempt += 1) {
    await flushWork();

    try {
      assertion();
      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

describe('useUnlearnedWordListSource runtime', () => {
  let queryClient: QueryClient;
  let renderer: TestRenderer.ReactTestRenderer | null;
  let toastSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    queryClient = createQueryClient();
    renderer = null;
    latestResult = null;
    fetchMockUnlearnedUnitProgressPageMock.mockReset();
    toast.clear();
    toastSpy = vi.spyOn(toast, 'show');
  });

  afterEach(() => {
    act(() => {
      renderer?.unmount();
    });
    queryClient.clear();
    toast.clear();
    vi.restoreAllMocks();
  });

  function renderHarness() {
    act(() => {
      renderer = TestRenderer.create(
        <QueryClientProvider client={queryClient}>
          <Harness />
        </QueryClientProvider>
      );
    });
  }

  it('loads the first unlearned page and flattens items for the page', async () => {
    fetchMockUnlearnedUnitProgressPageMock.mockResolvedValueOnce(
      createPage({ ids: [1, 2, 3], nextCursor: 'mock-unlearned-page:1' })
    );

    renderHarness();

    await waitForAssertion(() => {
      expect(latestResult?.items).toEqual([
        {
          id: '1',
          coarseUnitId: 1,
          label: 'word 1',
          partOfSpeech: 'noun',
          chineseLabel: '意思 1',
          chineseDefinition: '释义 1',
          progress: 11,
        },
        {
          id: '2',
          coarseUnitId: 2,
          label: 'word 2',
          partOfSpeech: null,
          chineseLabel: '',
          chineseDefinition: '释义 2',
          progress: 12,
        },
        {
          id: '3',
          coarseUnitId: 3,
          label: 'word 3',
          partOfSpeech: 'noun',
          chineseLabel: '',
          chineseDefinition: '释义 3',
          progress: 13,
        },
      ]);
      expect(latestResult?.isInitialLoading).toBe(false);
    });

    expect(fetchMockUnlearnedUnitProgressPageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        cursor: undefined,
        signal: expect.any(AbortSignal),
      })
    );
  });

  it('appends the next cursor page when requestMore is called', async () => {
    fetchMockUnlearnedUnitProgressPageMock
      .mockResolvedValueOnce(createPage({ ids: [1], nextCursor: 'mock-unlearned-page:1' }))
      .mockResolvedValueOnce(
        createPage({
          cursor: 'mock-unlearned-page:1',
          ids: [2],
          nextCursor: 'mock-unlearned-page:2',
        })
      );

    renderHarness();

    await waitForAssertion(() => {
      expect(latestResult?.items.map((item) => item.id)).toEqual(['1']);
    });

    await act(async () => {
      await latestResult?.requestMore();
    });

    await waitForAssertion(() => {
      expect(latestResult?.items.map((item) => item.id)).toEqual(['1', '2']);
    });
    expect(fetchMockUnlearnedUnitProgressPageMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        cursor: 'mock-unlearned-page:1',
      })
    );
  });

  it('refreshes without a cursor and replaces existing pages', async () => {
    fetchMockUnlearnedUnitProgressPageMock
      .mockResolvedValueOnce(createPage({ ids: [1], nextCursor: 'mock-unlearned-page:1' }))
      .mockResolvedValueOnce(
        createPage({
          cursor: 'mock-unlearned-page:1',
          ids: [2],
          nextCursor: 'mock-unlearned-page:2',
        })
      )
      .mockResolvedValueOnce(createPage({ ids: [9], nextCursor: 'mock-unlearned-page:1' }));

    renderHarness();

    await waitForAssertion(() => {
      expect(latestResult?.items.map((item) => item.id)).toEqual(['1']);
    });

    await act(async () => {
      await latestResult?.requestMore();
    });

    await waitForAssertion(() => {
      expect(latestResult?.items.map((item) => item.id)).toEqual(['1', '2']);
    });

    await act(async () => {
      await latestResult?.refresh();
    });

    expect(queryClient.getQueryData(UNLEARNED_WORD_LIST_QUERY_KEY)).toMatchObject({
      pages: [
        {
          items: [
            expect.objectContaining({
              coarseUnitId: 9,
            }),
          ],
        },
      ],
      pageParams: [undefined],
    });
    expect(latestResult?.items.map((item) => item.id)).toEqual(['9']);
    expect(fetchMockUnlearnedUnitProgressPageMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        cursor: undefined,
      })
    );
  });

  it('does not request more while the next page is already fetching', async () => {
    const nextPage = createDeferredPage(
      createPage({
        cursor: 'mock-unlearned-page:1',
        ids: [2],
        nextCursor: 'mock-unlearned-page:2',
      })
    );

    fetchMockUnlearnedUnitProgressPageMock
      .mockResolvedValueOnce(createPage({ ids: [1], nextCursor: 'mock-unlearned-page:1' }))
      .mockReturnValueOnce(nextPage.promise);

    renderHarness();

    await waitForAssertion(() => {
      expect(latestResult?.items.map((item) => item.id)).toEqual(['1']);
    });

    act(() => {
      void latestResult?.requestMore();
      void latestResult?.requestMore();
    });

    await flushWork();
    expect(fetchMockUnlearnedUnitProgressPageMock).toHaveBeenCalledTimes(2);

    await act(async () => {
      nextPage.resolve();
      await nextPage.promise;
    });
  });

  it('shows a toast and keeps existing items when loading another page fails', async () => {
    fetchMockUnlearnedUnitProgressPageMock
      .mockResolvedValueOnce(createPage({ ids: [1], nextCursor: 'mock-unlearned-page:1' }))
      .mockRejectedValueOnce(new Error('append failed'));

    renderHarness();

    await waitForAssertion(() => {
      expect(latestResult?.items.map((item) => item.id)).toEqual(['1']);
    });

    await act(async () => {
      await latestResult?.requestMore();
    });

    expect(latestResult?.items.map((item) => item.id)).toEqual(['1']);
    expect(toastSpy).toHaveBeenCalledWith({
      kind: 'error',
      title: '加载更多单词失败',
    });
  });
});
