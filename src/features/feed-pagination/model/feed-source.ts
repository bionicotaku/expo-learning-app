import type { InfiniteData, QueryClient } from '@tanstack/react-query';

import { fetchFeedPage, type FeedItem, type FeedPageResult } from '@/entities/feed';

import { NETWORK_DELAY_MS, PAGE_SIZE } from './feed-pagination-policy';
import { FEED_QUERY_KEY } from './use-feed-infinite-query';

export function flattenFeedPages(
  data: InfiniteData<FeedPageResult> | undefined
): FeedItem[] {
  return data?.pages.flatMap((page) => page.items) ?? [];
}

export function findFeedItemIndex(
  items: FeedItem[],
  videoId: string | null | undefined
): number {
  if (!videoId) {
    return -1;
  }

  return items.findIndex((item) => item.id === videoId);
}

export function buildFirstPageFeedData(
  firstPage: FeedPageResult
): InfiniteData<FeedPageResult> {
  return {
    pages: [firstPage],
    pageParams: [0],
  };
}

type RefreshFeedSourceOptions = {
  fetchFirstPage?: () => Promise<FeedPageResult>;
};

export async function refreshFeedSource(
  queryClient: QueryClient,
  options: RefreshFeedSourceOptions = {}
) {
  await queryClient.cancelQueries({ queryKey: FEED_QUERY_KEY, exact: true });
  const fetchFirstPage =
    options.fetchFirstPage ??
    (() =>
      fetchFeedPage({
        offset: 0,
        limit: PAGE_SIZE,
        delayMs: NETWORK_DELAY_MS,
      }));
  const firstPage = await fetchFirstPage();

  queryClient.setQueryData(FEED_QUERY_KEY, buildFirstPageFeedData(firstPage));
}
