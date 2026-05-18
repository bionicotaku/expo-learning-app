import { QueryClient } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as feedEntity from '@/entities/feed';
import type { FeedItem, FeedResponse } from '@/entities/feed';
import { mapFeedItemToVideoListItem, type VideoListItem } from '@/entities/video';
import { useVideoRuntimeStore } from '@/features/video-runtime';
import { toast } from '@/shared/lib/toast';

import * as feedSource from './feed-source';

function createVideoId(index: number) {
  return `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`;
}

function createFeedItem(index: number): FeedItem {
  return {
    video_id: createVideoId(index),
    title: `Clip ${index + 1}`,
    description: `Description ${index + 1}`,
    video_url: `https://example.com/${index + 1}.m3u8`,
    cover_image_url: `https://example.com/${index + 1}.webp`,
    duration_seconds: 70 + index,
    view_count: 7000 + index * 100,
    like_count: 300 + index,
    favorite_count: 40 + index,
    learning_units: [
      {
        coarse_unit_id: 89008 + index,
        text: `unit ${index + 1}`,
        role: 'near_future',
        is_primary: true,
        evidence_sentence_index: 15,
        evidence_span_index: 1,
        evidence_start_ms: 31493,
        evidence_end_ms: 31670,
      },
    ],
  };
}

function createFeedResponse(
  items: FeedItem[],
  recommendationRunId = '00000000-0000-4000-8000-000000000000'
): FeedResponse {
  return {
    recommendation_run_id: recommendationRunId,
    items,
  };
}

describe('feed source helpers', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.restoreAllMocks();
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
    toast.clear();
  });

  it('uses a stable query key for the main feed snapshot', () => {
    expect(feedSource.FEED_QUERY_KEY).toEqual(['feed', 'main']);
  });

  it('lets the initial successful feed fetch register membership without replacing local runtime overrides', async () => {
    const fetchFeedSpy = vi
      .spyOn(feedEntity, 'fetchFeed')
      .mockResolvedValue(createFeedResponse([createFeedItem(0), createFeedItem(1)]));

    useVideoRuntimeStore.getState().setFlags(
      '00000000-0000-4000-8000-000000000001',
      { isLiked: true },
      { isLiked: false, isFavorited: false }
    );
    useVideoRuntimeStore.getState().setFlags(
      '00000000-0000-4000-8000-000000000003',
      { isFavorited: true },
      { isLiked: false, isFavorited: false }
    );

    const snapshot = await feedSource.fetchInitialFeedSourceSnapshot();

    expect(snapshot.items).toEqual([
      mapFeedItemToVideoListItem(
        createFeedItem(0),
        '00000000-0000-4000-8000-000000000000'
      ),
      mapFeedItemToVideoListItem(
        createFeedItem(1),
        '00000000-0000-4000-8000-000000000000'
      ),
    ]);
    expect(useVideoRuntimeStore.getState().overridesByVideoId).toEqual({
      '00000000-0000-4000-8000-000000000001': {
        isLiked: true,
      },
      '00000000-0000-4000-8000-000000000003': {
        isFavorited: true,
      },
    });
    expect(useVideoRuntimeStore.getState().sourceVideoIds).toEqual({
      feed: {
        '00000000-0000-4000-8000-000000000001': true,
        '00000000-0000-4000-8000-000000000002': true,
      },
      history: {},
    });

    fetchFeedSpy.mockRestore();
  });

  it('appends another unique batch into the shared source and exposes an extending flag while the request is in flight', async () => {
    let releaseRequest!: () => void;
    const controller = (feedSource as typeof feedSource & {
      createFeedSourceController: (repository: {
        fetchFeed: () => Promise<FeedResponse>;
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
          new Promise<FeedResponse>((resolve) => {
            releaseRequest = () => {
              resolve(createFeedResponse([createFeedItem(0), createFeedItem(1)]));
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
        mapFeedItemToVideoListItem(
          createFeedItem(0),
          '00000000-0000-4000-8000-000000000000'
        ),
        mapFeedItemToVideoListItem(
          createFeedItem(1),
          '00000000-0000-4000-8000-000000000000'
        ),
      ],
      isExtending: false,
      isRefreshing: false,
    });
  });

  it('deduplicates concurrent requestMore calls and refresh replaces the assembled source after the in-flight append settles', async () => {
    const fetchFeed = vi
      .fn<() => Promise<FeedResponse>>()
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve(createFeedResponse([createFeedItem(0), createFeedItem(1)]));
            }, 0);
          })
      )
      .mockResolvedValueOnce(
        createFeedResponse(
          [createFeedItem(8)],
          '00000000-0000-4000-8000-000000000008'
        )
      );
    const controller = (feedSource as typeof feedSource & {
      createFeedSourceController: (repository: {
        fetchFeed: () => Promise<FeedResponse>;
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
      items: [
        mapFeedItemToVideoListItem(
          createFeedItem(8),
          '00000000-0000-4000-8000-000000000008'
        ),
      ],
      isExtending: false,
      isRefreshing: false,
    });
  });

  it('lets append union returned ids into feed membership without replacing local runtime overrides for those ids', async () => {
    const controller = (feedSource as typeof feedSource & {
      createFeedSourceController: (repository: {
        fetchFeed: () => Promise<FeedResponse>;
      }) => {
        requestMore: (queryClient: QueryClient) => Promise<void>;
        refresh: (queryClient: QueryClient) => Promise<void>;
      };
    }).createFeedSourceController({
      fetchFeed: vi
        .fn()
        .mockResolvedValueOnce(createFeedResponse([createFeedItem(0), createFeedItem(1)]))
        .mockResolvedValueOnce(createFeedResponse([createFeedItem(0)])),
    });

    useVideoRuntimeStore.getState().setFlags(
      '00000000-0000-4000-8000-000000000001',
      { isLiked: true },
      { isLiked: false, isFavorited: false }
    );
    useVideoRuntimeStore.getState().setFlags(
      '00000000-0000-4000-8000-000000000003',
      { isFavorited: true },
      { isLiked: false, isFavorited: false }
    );

    await controller.requestMore(queryClient);

    expect(useVideoRuntimeStore.getState().overridesByVideoId).toEqual({
      '00000000-0000-4000-8000-000000000001': {
        isLiked: true,
      },
      '00000000-0000-4000-8000-000000000003': {
        isFavorited: true,
      },
    });
    expect(useVideoRuntimeStore.getState().sourceVideoIds).toEqual({
      feed: {
        '00000000-0000-4000-8000-000000000001': true,
        '00000000-0000-4000-8000-000000000002': true,
      },
      history: {},
    });

    useVideoRuntimeStore
      .getState()
      .acceptFetchedIds('history', ['00000000-0000-4000-8000-000000000002']);
    useVideoRuntimeStore.getState().setFlags(
      '00000000-0000-4000-8000-000000000002',
      { isLiked: true },
      { isLiked: false, isFavorited: false }
    );
    useVideoRuntimeStore.getState().setFlags(
      '00000000-0000-4000-8000-000000000001',
      { isLiked: true },
      { isLiked: false, isFavorited: false }
    );

    await controller.refresh(queryClient);

    expect(useVideoRuntimeStore.getState().overridesByVideoId).toEqual({
      '00000000-0000-4000-8000-000000000001': {
        isLiked: true,
      },
      '00000000-0000-4000-8000-000000000002': {
        isLiked: true,
      },
      '00000000-0000-4000-8000-000000000003': {
        isFavorited: true,
      },
    });
    expect(useVideoRuntimeStore.getState().sourceVideoIds).toEqual({
      feed: {
        '00000000-0000-4000-8000-000000000001': true,
      },
      history: {
        '00000000-0000-4000-8000-000000000002': true,
      },
    });
  });

  it('does not mutate runtime override or membership when a feed request fails', async () => {
    const toastSpy = vi.spyOn(toast, 'show');
    const controller = (feedSource as typeof feedSource & {
      createFeedSourceController: (repository: {
        fetchFeed: () => Promise<FeedResponse>;
      }) => {
        requestMore: (queryClient: QueryClient) => Promise<void>;
      };
    }).createFeedSourceController({
      fetchFeed: vi.fn().mockRejectedValue(new Error('network failed')),
    });

    useVideoRuntimeStore
      .getState()
      .acceptFetchedIds('feed', ['00000000-0000-4000-8000-000000000001']);
    useVideoRuntimeStore.getState().setFlags(
      '00000000-0000-4000-8000-000000000001',
      { isLiked: true },
      { isLiked: false, isFavorited: false }
    );

    await expect(controller.requestMore(queryClient)).rejects.toThrow('network failed');

    expect(toastSpy).toHaveBeenCalledWith({
      kind: 'error',
      title: '加载更多视频失败',
    });
    expect(useVideoRuntimeStore.getState().overridesByVideoId).toEqual({
      '00000000-0000-4000-8000-000000000001': {
        isLiked: true,
      },
    });
    expect(useVideoRuntimeStore.getState().sourceVideoIds).toEqual({
      feed: {
        '00000000-0000-4000-8000-000000000001': true,
      },
      history: {},
    });
  });
});
