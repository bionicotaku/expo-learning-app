import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchFeedPage } from '@/entities/feed';

import { NETWORK_DELAY_MS, PAGE_SIZE } from './feed-pagination-policy';

export const FEED_QUERY_KEY = ['feed', 'main'] as const;

export function useFeedInfiniteQuery() {
  return useInfiniteQuery({
    queryKey: FEED_QUERY_KEY,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      fetchFeedPage({
        offset: pageParam,
        limit: PAGE_SIZE,
        delayMs: NETWORK_DELAY_MS,
      }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) {
        return undefined;
      }

      return lastPage.nextOffset;
    },
  });
}
