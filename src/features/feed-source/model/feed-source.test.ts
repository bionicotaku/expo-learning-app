import { QueryClient } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as feedEntity from '@/entities/feed';
import type { FeedItem } from '@/entities/feed';
import { mapFeedItemToVideoListItem, type VideoListItem } from '@/entities/video';
import { useVideoRuntimeStore } from '@/features/video-runtime';

import * as feedSource from './feed-source';

function createFeedItem(index: number): FeedItem {
  return {
    videoId: `the-office-health-care-video-${index + 1}`,
    title: `Clip ${index + 1}`,
    description: `Description ${index + 1}`,
    videoUrl: `https://example.com/${index + 1}.m3u8`,
    coverImageUrl: `https://example.com/${index + 1}.webp`,
    durationSeconds: 70 + index,
    viewCount: 7000 + index * 100,
    tags: [`TAG ${index + 1}`],
    isLiked: false,
    isFavorited: false,
  };
}

describe('feed source helpers', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });
    useVideoRuntimeStore.getState().clearAll();
  });

  it('uses a stable query key for the main feed snapshot', () => {
    expect(feedSource.FEED_QUERY_KEY).toEqual(['feed', 'main']);
  });

  it('lets the initial successful feed fetch replace local runtime overrides for returned video ids', async () => {
    const fetchFeedSpy = vi.spyOn(feedEntity, 'fetchFeed').mockResolvedValue({
      items: [createFeedItem(0), createFeedItem(1)],
    });

    useVideoRuntimeStore.getState().setFlags(
      'the-office-health-care-video-1',
      { isLiked: true },
      { isLiked: false, isFavorited: false }
    );
    useVideoRuntimeStore.getState().setFlags(
      'the-office-health-care-video-3',
      { isFavorited: true },
      { isLiked: false, isFavorited: false }
    );

    const snapshot = await feedSource.fetchInitialFeedSourceSnapshot();

    expect(snapshot.items).toEqual([
      mapFeedItemToVideoListItem(createFeedItem(0)),
      mapFeedItemToVideoListItem(createFeedItem(1)),
    ]);
    expect(useVideoRuntimeStore.getState().overridesByVideoId).toEqual({
      'the-office-health-care-video-3': {
        isFavorited: true,
      },
    });
    expect(useVideoRuntimeStore.getState().sourceVideoIds).toEqual({
      feed: {
        'the-office-health-care-video-1': true,
        'the-office-health-care-video-2': true,
      },
      history: {},
    });

    fetchFeedSpy.mockRestore();
  });

  it('appends another unique batch into the shared source and exposes an extending flag while the request is in flight', async () => {
    let releaseRequest!: () => void;
    const controller = (feedSource as typeof feedSource & {
      createFeedSourceController: (repository: {
        fetchFeed: () => Promise<{ items: FeedItem[] }>;
      }) => {
        requestMore: (queryClient: QueryClient) => Promise<void>;
      };
      getFeedSourceSnapshot: (queryClient: QueryClient) => {
        items: VideoListItem[];
        isExtending: boolean;
        isRefreshing: boolean;
      };
    }).createFeedSourceController({
      fetchFeed: vi.fn(
        () =>
          new Promise<{ items: FeedItem[] }>((resolve) => {
            releaseRequest = () => {
              resolve({
                items: [createFeedItem(0), createFeedItem(1)],
              });
            };
          })
      ),
    });

    const request = controller.requestMore(queryClient);

    expect(
      (feedSource as typeof feedSource & {
        getFeedSourceSnapshot: (queryClient: QueryClient) => {
          items: VideoListItem[];
          isExtending: boolean;
          isRefreshing: boolean;
        };
      }).getFeedSourceSnapshot(queryClient)
    ).toEqual({
      items: [],
      isExtending: true,
      isRefreshing: false,
    });

    releaseRequest();
    await request;

    expect(
      (feedSource as typeof feedSource & {
        getFeedSourceSnapshot: (queryClient: QueryClient) => {
          items: VideoListItem[];
          isExtending: boolean;
          isRefreshing: boolean;
        };
      }).getFeedSourceSnapshot(queryClient)
    ).toEqual({
      items: [
        mapFeedItemToVideoListItem(createFeedItem(0)),
        mapFeedItemToVideoListItem(createFeedItem(1)),
      ],
      isExtending: false,
      isRefreshing: false,
    });
  });

  it('deduplicates concurrent requestMore calls and refresh replaces the assembled source after the in-flight append settles', async () => {
    const fetchFeed = vi
      .fn<() => Promise<{ items: FeedItem[] }>>()
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                items: [createFeedItem(0), createFeedItem(1)],
              });
            }, 0);
          })
      )
      .mockResolvedValueOnce({
        items: [createFeedItem(8)],
      });
    const controller = (feedSource as typeof feedSource & {
      createFeedSourceController: (repository: {
        fetchFeed: () => Promise<{ items: FeedItem[] }>;
      }) => {
        requestMore: (queryClient: QueryClient) => Promise<void>;
        refresh: (queryClient: QueryClient) => Promise<void>;
      };
      getFeedSourceSnapshot: (queryClient: QueryClient) => {
        items: VideoListItem[];
        isExtending: boolean;
        isRefreshing: boolean;
      };
    }).createFeedSourceController({ fetchFeed });

    const firstRequest = controller.requestMore(queryClient);
    const secondRequest = controller.requestMore(queryClient);
    const refreshRequest = controller.refresh(queryClient);

    await Promise.all([firstRequest, secondRequest, refreshRequest]);

    expect(fetchFeed).toHaveBeenCalledTimes(2);
    expect(
      (feedSource as typeof feedSource & {
        getFeedSourceSnapshot: (queryClient: QueryClient) => {
          items: VideoListItem[];
          isExtending: boolean;
          isRefreshing: boolean;
        };
      }).getFeedSourceSnapshot(queryClient)
    ).toEqual({
      items: [mapFeedItemToVideoListItem(createFeedItem(8))],
      isExtending: false,
      isRefreshing: false,
    });
  });

  it('lets append union returned ids into feed membership and replace local runtime overrides for those ids', async () => {
    const controller = (feedSource as typeof feedSource & {
      createFeedSourceController: (repository: {
        fetchFeed: () => Promise<{ items: FeedItem[] }>;
      }) => {
        requestMore: (queryClient: QueryClient) => Promise<void>;
        refresh: (queryClient: QueryClient) => Promise<void>;
      };
    }).createFeedSourceController({
      fetchFeed: vi
        .fn()
        .mockResolvedValueOnce({
          items: [createFeedItem(0), createFeedItem(1)],
        })
        .mockResolvedValueOnce({
          items: [createFeedItem(0)],
        }),
    });

    useVideoRuntimeStore.getState().setFlags(
      'the-office-health-care-video-1',
      { isLiked: true },
      { isLiked: false, isFavorited: false }
    );
    useVideoRuntimeStore.getState().setFlags(
      'the-office-health-care-video-3',
      { isFavorited: true },
      { isLiked: false, isFavorited: false }
    );

    await controller.requestMore(queryClient);

    expect(useVideoRuntimeStore.getState().overridesByVideoId).toEqual({
      'the-office-health-care-video-3': {
        isFavorited: true,
      },
    });
    expect(useVideoRuntimeStore.getState().sourceVideoIds).toEqual({
      feed: {
        'the-office-health-care-video-1': true,
        'the-office-health-care-video-2': true,
      },
      history: {},
    });

    useVideoRuntimeStore
      .getState()
      .acceptFetchedIds('history', ['the-office-health-care-video-2']);
    useVideoRuntimeStore.getState().setFlags(
      'the-office-health-care-video-2',
      { isLiked: true },
      { isLiked: false, isFavorited: false }
    );
    useVideoRuntimeStore.getState().setFlags(
      'the-office-health-care-video-1',
      { isLiked: true },
      { isLiked: false, isFavorited: false }
    );

    await controller.refresh(queryClient);

    expect(useVideoRuntimeStore.getState().overridesByVideoId).toEqual({
      'the-office-health-care-video-2': {
        isLiked: true,
      },
      'the-office-health-care-video-3': {
        isFavorited: true,
      },
    });
    expect(useVideoRuntimeStore.getState().sourceVideoIds).toEqual({
      feed: {
        'the-office-health-care-video-1': true,
      },
      history: {
        'the-office-health-care-video-2': true,
      },
    });
  });

  it('does not mutate runtime override or membership when a feed request fails', async () => {
    const controller = (feedSource as typeof feedSource & {
      createFeedSourceController: (repository: {
        fetchFeed: () => Promise<{ items: FeedItem[] }>;
      }) => {
        requestMore: (queryClient: QueryClient) => Promise<void>;
      };
    }).createFeedSourceController({
      fetchFeed: vi.fn().mockRejectedValue(new Error('network failed')),
    });

    useVideoRuntimeStore
      .getState()
      .acceptFetchedIds('feed', ['the-office-health-care-video-1']);
    useVideoRuntimeStore.getState().setFlags(
      'the-office-health-care-video-1',
      { isLiked: true },
      { isLiked: false, isFavorited: false }
    );

    await expect(controller.requestMore(queryClient)).rejects.toThrow('network failed');

    expect(useVideoRuntimeStore.getState().overridesByVideoId).toEqual({
      'the-office-health-care-video-1': {
        isLiked: true,
      },
    });
    expect(useVideoRuntimeStore.getState().sourceVideoIds).toEqual({
      feed: {
        'the-office-health-care-video-1': true,
      },
      history: {},
    });
  });
});
