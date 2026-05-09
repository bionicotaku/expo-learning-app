import { useCallback, useMemo, useRef, useState } from 'react';
import {
  type InfiniteData,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { fetchMockUnlearnedUnitProgressPage } from '@/entities/learning-unit-progress/api/mock-unit-progress-repository';
import type { LearningUnitProgressPage } from '@/entities/learning-unit-progress';
import { toast } from '@/shared/lib/toast';

import { mapLearningUnitProgressItemToWordListSourceItem } from './mappers';
import type { WordListSourceItem } from './types';
import { UNLEARNED_WORD_LIST_QUERY_KEY } from './word-list-query';

const WORD_LIST_PAGE_LIMIT = 24;

type UnlearnedWordListInfiniteData = InfiniteData<LearningUnitProgressPage, string | undefined>;

export type UnlearnedWordListSourceResult = {
  items: WordListSourceItem[];
  error: Error | null;
  isInitialLoading: boolean;
  isRefreshing: boolean;
  isExtending: boolean;
  refresh: () => Promise<void>;
  requestMore: () => Promise<void>;
};

export function useUnlearnedWordListSource(): UnlearnedWordListSourceResult {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isRequestingMoreRef = useRef(false);
  const query = useInfiniteQuery<
    LearningUnitProgressPage,
    Error,
    UnlearnedWordListInfiniteData,
    typeof UNLEARNED_WORD_LIST_QUERY_KEY,
    string | undefined
  >({
    queryKey: UNLEARNED_WORD_LIST_QUERY_KEY,
    queryFn: ({ pageParam, signal }) =>
      fetchMockUnlearnedUnitProgressPage({
        limit: WORD_LIST_PAGE_LIMIT,
        cursor: pageParam,
        signal,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.page.hasMore ? lastPage.page.nextCursor ?? undefined : undefined,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const items = useMemo(
    () =>
      query.data?.pages.flatMap((page) =>
        page.items.map(mapLearningUnitProgressItemToWordListSourceItem)
      ) ?? [],
    [query.data]
  );

  const refresh = useCallback(async () => {
    if (isRefreshing) {
      return;
    }

    setIsRefreshing(true);

    try {
      const firstPage = await fetchMockUnlearnedUnitProgressPage({
        limit: WORD_LIST_PAGE_LIMIT,
        cursor: undefined,
      });

      queryClient.setQueryData<UnlearnedWordListInfiniteData>(
        UNLEARNED_WORD_LIST_QUERY_KEY,
        {
          pages: [firstPage],
          pageParams: [undefined],
        }
      );
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, queryClient]);

  const requestMore = useCallback(async () => {
    if (
      isRequestingMoreRef.current ||
      isRefreshing ||
      query.isFetchingNextPage ||
      query.isRefetching ||
      !query.hasNextPage
    ) {
      return;
    }

    isRequestingMoreRef.current = true;

    try {
      const result = await query.fetchNextPage();

      if (result.isError) {
        toast.show({
          kind: 'error',
          title: '加载更多单词失败',
        });
      }
    } finally {
      isRequestingMoreRef.current = false;
    }
  }, [isRefreshing, query]);

  return {
    items,
    error: items.length === 0 ? query.error : null,
    isInitialLoading: query.isPending && items.length === 0,
    isRefreshing,
    isExtending: query.isFetchingNextPage,
    refresh,
    requestMore,
  };
}
