import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import type { FeedItem, FeedPageResult } from '@/entities/feed';
import { createQueryClient } from '@/shared/lib/react-query/query-client';

import { FEED_QUERY_KEY } from './use-feed-infinite-query';
import {
  buildFirstPageFeedData,
  findFeedItemIndex,
  flattenFeedPages,
  refreshFeedSource,
} from './feed-source';

function createFeedItem(indexInFeed: number): FeedItem {
  return {
    id: `feed-${indexInFeed + 1}`,
    kind: 'feed-item',
    assetId: `asset-${(indexInFeed % 5) + 1}`,
    uri: `https://example.com/${indexInFeed + 1}.mp4`,
    title: `Clip ${indexInFeed + 1}`,
    subtitle: `Page ${(indexInFeed / 10) | 0 + 1}`,
    page: Math.floor(indexInFeed / 10) + 1,
    indexInFeed,
  };
}

function createFeedPage(offset: number): FeedPageResult {
  return {
    items: Array.from({ length: 10 }, (_, index) => createFeedItem(offset + index)),
    nextOffset: offset + 10,
    hasMore: true,
  };
}

function createInfiniteFeedData(): InfiniteData<FeedPageResult> {
  return {
    pages: [createFeedPage(0), createFeedPage(10)],
    pageParams: [0, 10],
  };
}

describe('feed source helpers', () => {
  it('flattens paginated feed data into a single ordered list', () => {
    expect(flattenFeedPages(createInfiniteFeedData())).toHaveLength(20);
    expect(flattenFeedPages(createInfiniteFeedData())[10]?.id).toBe('feed-11');
  });

  it('finds the index of a feed item by video id', () => {
    const items = flattenFeedPages(createInfiniteFeedData());

    expect(findFeedItemIndex(items, 'feed-1')).toBe(0);
    expect(findFeedItemIndex(items, 'feed-14')).toBe(13);
    expect(findFeedItemIndex(items, 'missing')).toBe(-1);
  });

  it('builds a single-page infinite feed snapshot from a refreshed first page', () => {
    const rebuilt = buildFirstPageFeedData(createFeedPage(0));

    expect(rebuilt.pages).toHaveLength(1);
    expect(rebuilt.pageParams).toEqual([0]);
    expect(rebuilt.pages[0]?.items).toHaveLength(10);
  });

  it('keeps the existing list in place until refresh succeeds, then replaces it with the new first page', async () => {
    const queryClient: QueryClient = createQueryClient();
    queryClient.setQueryData(FEED_QUERY_KEY, createInfiniteFeedData());
    let resolveRefresh!: (page: FeedPageResult) => void;
    const fetchFirstPage = new Promise<FeedPageResult>((resolve) => {
      resolveRefresh = resolve;
    });

    const refreshPromise = refreshFeedSource(queryClient, {
      fetchFirstPage: () => fetchFirstPage,
    });

    const beforeResolve = queryClient.getQueryData<InfiniteData<FeedPageResult>>(FEED_QUERY_KEY);
    expect(beforeResolve?.pages).toHaveLength(2);

    resolveRefresh(createFeedPage(0));
    await refreshPromise;

    const refreshed = queryClient.getQueryData<InfiniteData<FeedPageResult>>(FEED_QUERY_KEY);
    expect(refreshed?.pages).toHaveLength(1);
    expect(refreshed?.pages[0]?.items).toHaveLength(10);
    expect(refreshed?.pages[0]?.items[0]?.id).toBe('feed-1');
  });
});
