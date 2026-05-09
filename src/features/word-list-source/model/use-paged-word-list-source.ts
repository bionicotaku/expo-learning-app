import { useCallback, useMemo, useRef, useState } from 'react';
import {
  type InfiniteData,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';

import type {
  LearningUnitProgressPage,
  LearningUnitProgressPageParams,
} from '@/entities/learning-unit-progress';
import { toast } from '@/shared/lib/toast';

import { mapLearningUnitProgressItemToWordListSourceItem } from './mappers';
import type { WordListSourceResult } from './types';

const WORD_LIST_PAGE_LIMIT = 24;

type WordListSourceQueryKey = readonly ['word-list-source', 'unlearned' | 'learned'];
type WordListInfiniteData = InfiniteData<LearningUnitProgressPage, string | undefined>;

type UsePagedWordListSourceConfig = {
  queryKey: WordListSourceQueryKey;
  enabled: boolean;
  fetchPage: (params: LearningUnitProgressPageParams) => Promise<LearningUnitProgressPage>;
  appendErrorTitle: string;
};

export function usePagedWordListSource({
  appendErrorTitle,
  enabled,
  fetchPage,
  queryKey,
}: UsePagedWordListSourceConfig): WordListSourceResult {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isRequestingMoreRef = useRef(false);
  const query = useInfiniteQuery<
    LearningUnitProgressPage,
    Error,
    WordListInfiniteData,
    WordListSourceQueryKey,
    string | undefined
  >({
    queryKey,
    queryFn: ({ pageParam, signal }) =>
      fetchPage({
        limit: WORD_LIST_PAGE_LIMIT,
        cursor: pageParam,
        signal,
      }),
    enabled,
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
    if (!enabled || isRefreshing) {
      return;
    }

    setIsRefreshing(true);

    try {
      if (items.length === 0) {
        const result = await query.refetch();

        if (result.isError) {
          throw result.error;
        }

        return;
      }

      const firstPage = await fetchPage({
        limit: WORD_LIST_PAGE_LIMIT,
        cursor: undefined,
      });

      queryClient.setQueryData<WordListInfiniteData>(queryKey, {
        pages: [firstPage],
        pageParams: [undefined],
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [enabled, fetchPage, isRefreshing, items.length, query, queryClient, queryKey]);

  const requestMore = useCallback(async () => {
    if (
      !enabled ||
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
          title: appendErrorTitle,
        });
      }
    } catch {
      toast.show({
        kind: 'error',
        title: appendErrorTitle,
      });
    } finally {
      isRequestingMoreRef.current = false;
    }
  }, [appendErrorTitle, enabled, isRefreshing, query]);

  return {
    items,
    error: items.length === 0 ? query.error : null,
    isInitialLoading: enabled && query.isPending && items.length === 0,
    isRefreshing,
    isExtending: enabled && query.isFetchingNextPage,
    refresh,
    requestMore,
  };
}
