import type { QueryClient } from '@tanstack/react-query';

import { fetchFeed, type FeedItem, type FeedResponse } from '@/entities/feed';
import {
  mapFeedItemToVideoListItem,
  type VideoListItem,
} from '@/entities/video';
import { useVideoRuntimeStore } from '@/features/video-runtime';
import { batchSourceHandoff } from './batch-source-handoff';

export const FEED_QUERY_KEY = ['feed', 'main'] as const;

export type FeedSourceSnapshot = {
  items: VideoListItem[];
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

function uniqueVideoListItems(items: VideoListItem[]) {
  const nextItemsById = new Map<string, VideoListItem>();

  for (const item of items) {
    nextItemsById.set(item.videoId, item);
  }

  return Array.from(nextItemsById.values());
}

function mapFeedItemsToVideoListItems(items: FeedItem[]) {
  return items.map(mapFeedItemToVideoListItem);
}

function getSourceVideoIds(items: FeedItem[]) {
  return items.map((item) => item.videoId);
}

function createFeedSourceSnapshot(items: FeedItem[]): FeedSourceSnapshot {
  return {
    items: uniqueVideoListItems(mapFeedItemsToVideoListItems(items)),
    isRefreshing: false,
    isExtending: false,
  };
}

function mergeFeedSourceItems(currentItems: VideoListItem[], nextItems: FeedItem[]) {
  return uniqueVideoListItems([...currentItems, ...mapFeedItemsToVideoListItems(nextItems)]);
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
      const videoIds = getSourceVideoIds(response.items);

      batchSourceHandoff(() => {
        setFeedSourceSnapshot(queryClient, (snapshot) => ({
          items: mergeFeedSourceItems(snapshot.items, response.items),
          isExtending: false,
          isRefreshing: false,
        }));
        useVideoRuntimeStore.getState().acceptFetchedIds('feed', videoIds);
      });
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
            const response = await repository.fetchFeed();
            const snapshot = createFeedSourceSnapshot(response.items);
            const videoIds = getSourceVideoIds(response.items);

            batchSourceHandoff(() => {
              queryClient.setQueryData<FeedSourceSnapshot>(FEED_QUERY_KEY, snapshot);
              useVideoRuntimeStore.getState().replaceSourceSnapshot('feed', videoIds);
            });
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
  const response = await fetchFeed();
  useVideoRuntimeStore
    .getState()
    .replaceSourceSnapshot('feed', getSourceVideoIds(response.items));
  return createFeedSourceSnapshot(response.items);
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
