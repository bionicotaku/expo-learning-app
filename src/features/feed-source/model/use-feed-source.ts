import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import {
  FEED_QUERY_KEY,
  fetchInitialFeedSourceSnapshot,
  refreshFeedSource,
  requestMoreFeedSource,
} from './feed-source';

export function useFeedSource() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: FEED_QUERY_KEY,
    queryFn: fetchInitialFeedSourceSnapshot,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
  const snapshot = query.data;
  const items = snapshot?.items ?? [];
  const error = items.length === 0 ? (query.error as Error | null) : null;

  const refresh = useCallback(async () => {
    if (items.length === 0) {
      await query.refetch();
      return;
    }

    await refreshFeedSource(queryClient);
  }, [items.length, query, queryClient]);

  const requestMore = useCallback(async () => {
    await requestMoreFeedSource(queryClient);
  }, [queryClient]);

  return {
    items,
    error,
    isInitialLoading: query.isPending && items.length === 0,
    isRefreshing: snapshot?.isRefreshing ?? false,
    isExtending: snapshot?.isExtending ?? false,
    refresh,
    requestMore,
  };
}
