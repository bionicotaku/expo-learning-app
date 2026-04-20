import type { QueryClient } from '@tanstack/react-query';

import { fetchFeed, type FeedItem, type FeedResponse } from '@/entities/feed';

export const FEED_QUERY_KEY = ['feed', 'main'] as const;

export type FeedSourceSnapshot = {
  items: FeedItem[];
  isRefreshing: boolean;
  isExtending: boolean;
};

type FeedSourceRepository = {
  fetchFeed: () => Promise<FeedResponse>;
};

const emptyFeedSourceSnapshot: FeedSourceSnapshot = {
  items: [],
  isRefreshing: false,
  isExtending: false,
};

function uniqueFeedItems(items: FeedItem[]) {
  const nextItemsById = new Map<string, FeedItem>();

  for (const item of items) {
    nextItemsById.set(item.videoId, item);
  }

  return Array.from(nextItemsById.values());
}

function createFeedSourceSnapshot(items: FeedItem[]): FeedSourceSnapshot {
  return {
    items: uniqueFeedItems(items),
    isRefreshing: false,
    isExtending: false,
  };
}

function mergeFeedSourceItems(currentItems: FeedItem[], nextItems: FeedItem[]) {
  return uniqueFeedItems([...currentItems, ...nextItems]);
}

function getCurrentFeedSourceSnapshot(queryClient: QueryClient): FeedSourceSnapshot {
  return (
    queryClient.getQueryData<FeedSourceSnapshot>(FEED_QUERY_KEY) ?? emptyFeedSourceSnapshot
  );
}

function setFeedSourceSnapshot(
  queryClient: QueryClient,
  updater: (snapshot: FeedSourceSnapshot) => FeedSourceSnapshot
) {
  queryClient.setQueryData<FeedSourceSnapshot>(FEED_QUERY_KEY, (currentSnapshot) =>
    updater(currentSnapshot ?? emptyFeedSourceSnapshot)
  );
}

async function buildInitialFeedSourceSnapshot(repository: FeedSourceRepository) {
  const response = await repository.fetchFeed();
  return createFeedSourceSnapshot(response.items);
}

export function createFeedSourceController(repository: FeedSourceRepository) {
  let activeRequest: Promise<void> | null = null;
  let pendingRefresh: Promise<void> | null = null;

  const runAppend = async (queryClient: QueryClient) => {
    setFeedSourceSnapshot(queryClient, (snapshot) => ({
      ...snapshot,
      isExtending: true,
    }));

    try {
      const response = await repository.fetchFeed();

      setFeedSourceSnapshot(queryClient, (snapshot) => ({
        items: mergeFeedSourceItems(snapshot.items, response.items),
        isExtending: false,
        isRefreshing: false,
      }));
    } catch (error) {
      setFeedSourceSnapshot(queryClient, (snapshot) => ({
        ...snapshot,
        isExtending: false,
      }));
      throw error;
    }
  };

  return {
    async requestMore(queryClient: QueryClient) {
      if (activeRequest) {
        return activeRequest;
      }

      const request = runAppend(queryClient).finally(() => {
        activeRequest = null;
      });

      activeRequest = request;
      return request;
    },
    async refresh(queryClient: QueryClient) {
      if (pendingRefresh) {
        return pendingRefresh;
      }

      const request = (async () => {
        if (activeRequest) {
          await activeRequest.catch(() => undefined);
        }

        const refreshRequest = (async () => {
          setFeedSourceSnapshot(queryClient, (snapshot) => ({
            ...snapshot,
            isRefreshing: true,
          }));

          try {
            const snapshot = await buildInitialFeedSourceSnapshot(repository);
            queryClient.setQueryData<FeedSourceSnapshot>(FEED_QUERY_KEY, snapshot);
          } catch (error) {
            setFeedSourceSnapshot(queryClient, (snapshot) => ({
              ...snapshot,
              isRefreshing: false,
            }));
            throw error;
          }
        })().finally(() => {
          activeRequest = null;
        });

        activeRequest = refreshRequest;
        await refreshRequest;
      })().finally(() => {
        pendingRefresh = null;
      });

      pendingRefresh = request;
      return request;
    },
  };
}

const feedSourceController = createFeedSourceController({ fetchFeed });

export async function fetchInitialFeedSourceSnapshot() {
  return buildInitialFeedSourceSnapshot({ fetchFeed });
}

export function getFeedSourceSnapshot(queryClient: QueryClient): FeedSourceSnapshot {
  return getCurrentFeedSourceSnapshot(queryClient);
}

export function requestMoreFeedSource(queryClient: QueryClient) {
  return feedSourceController.requestMore(queryClient);
}

export function refreshFeedSource(queryClient: QueryClient) {
  return feedSourceController.refresh(queryClient);
}

export function findFeedItemIndex(
  items: FeedItem[],
  videoId: string | null | undefined
): number {
  if (!videoId) {
    return -1;
  }

  return items.findIndex((item) => item.videoId === videoId);
}
