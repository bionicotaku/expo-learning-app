import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { toast } from '@/shared/lib/toast';

import { WORD_LIST_SOURCE_QUERY_KEYS } from './word-list-query';
import { useLearnedWordListSource } from './use-learned-word-list-source';

const { fetchMockLearnedUnitProgressPageMock } = vi.hoisted(() => ({
  fetchMockLearnedUnitProgressPageMock: vi.fn(),
}));

vi.mock('@/entities/learning-unit-progress/api/mock-unit-progress-repository', () => ({
  fetchMockLearnedUnitProgressPage: fetchMockLearnedUnitProgressPageMock,
}));

type UseLearnedWordListSourceResult = ReturnType<typeof useLearnedWordListSource>;

let latestResult: UseLearnedWordListSourceResult | null = null;
let sourceEnabled = true;

function createPage({
  ids,
  nextCursor,
}: {
  ids: number[];
  nextCursor: string;
}) {
  return {
    items: ids.map((id) => ({
      coarseUnitId: id,
      kind: 'word',
      label: `learned ${id}`,
      partOfSpeech: 'verb',
      chineseLabel: `已学 ${id}`,
      chineseDefinition: `已学释义 ${id}`,
      progressPercent: 100,
      lastReviewedAt: null,
    })),
    page: {
      limit: ids.length,
      hasMore: true,
      nextCursor,
    },
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
  latestResult = useLearnedWordListSource({ enabled: sourceEnabled });
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

describe('useLearnedWordListSource runtime', () => {
  let queryClient: QueryClient;
  let renderer: TestRenderer.ReactTestRenderer | null;
  let toastSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    queryClient = createQueryClient();
    renderer = null;
    latestResult = null;
    sourceEnabled = true;
    fetchMockLearnedUnitProgressPageMock.mockReset();
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

  it('loads learned pages through the learned mock unit progress repository', async () => {
    fetchMockLearnedUnitProgressPageMock.mockResolvedValueOnce(
      createPage({ ids: [10], nextCursor: 'learned-page:1' })
    );

    renderHarness();

    await waitForAssertion(() => {
      expect(latestResult?.items).toEqual([
        {
          id: '10',
          coarseUnitId: 10,
          label: 'learned 10',
          partOfSpeech: 'verb',
          chineseLabel: '已学 10',
          chineseDefinition: '已学释义 10',
          progress: 100,
        },
      ]);
    });

    expect(fetchMockLearnedUnitProgressPageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        cursor: undefined,
        signal: expect.any(AbortSignal),
      })
    );
    expect(queryClient.getQueryData(WORD_LIST_SOURCE_QUERY_KEYS.learned)).toBeTruthy();
  });

  it('does not request learned data while disabled', async () => {
    sourceEnabled = false;

    renderHarness();

    await flushWork();

    expect(fetchMockLearnedUnitProgressPageMock).not.toHaveBeenCalled();
    expect(latestResult?.items).toEqual([]);
  });

  it('uses the shared word-list append failure toast for learned pages', async () => {
    fetchMockLearnedUnitProgressPageMock
      .mockResolvedValueOnce(createPage({ ids: [10], nextCursor: 'learned-page:1' }))
      .mockRejectedValueOnce(new Error('append failed'));

    renderHarness();

    await waitForAssertion(() => {
      expect(latestResult?.items.map((item) => item.id)).toEqual(['10']);
    });

    await act(async () => {
      await latestResult?.requestMore();
    });

    expect(toastSpy).toHaveBeenCalledWith({
      kind: 'error',
      title: '加载更多单词失败',
    });
  });
});
