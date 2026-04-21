import { describe, expect, it } from 'vitest';

import type { VideoListItem } from '@/entities/video';

import { resolveVideoDetailRouteTarget } from './resolve-video-detail-route-target';

const items: VideoListItem[] = [
  {
    coverImageUrl: null,
    description: 'desc 1',
    durationSeconds: 10,
    isFavorited: false,
    isLiked: false,
    tags: [],
    title: 'Video 1',
    videoId: 'video-1',
    videoUrl: 'https://example.com/1.m3u8',
    viewCount: 1,
  },
  {
    coverImageUrl: null,
    description: 'desc 2',
    durationSeconds: 20,
    isFavorited: false,
    isLiked: false,
    tags: [],
    title: 'Video 2',
    videoId: 'video-2',
    videoUrl: 'https://example.com/2.m3u8',
    viewCount: 2,
  },
];

describe('resolveVideoDetailRouteTarget', () => {
  it('returns the matching entry index and video id when the route video id exists', () => {
    expect(
      resolveVideoDetailRouteTarget({
        items,
        routeVideoId: 'video-2',
      })
    ).toEqual({
      entryIndex: 1,
      entryVideoId: 'video-2',
      sessionKey: 'route:video-2',
    });
  });

  it('falls back to the first item when the route misses the current canonical list', () => {
    expect(
      resolveVideoDetailRouteTarget({
        items,
        routeVideoId: 'video-999',
      })
    ).toEqual({
      entryIndex: 0,
      entryVideoId: 'video-1',
      sessionKey: 'route:video-999',
    });
  });

  it('returns a null entry video id when the canonical list is empty', () => {
    expect(
      resolveVideoDetailRouteTarget({
        items: [],
        routeVideoId: 'video-1',
      })
    ).toEqual({
      entryIndex: 0,
      entryVideoId: null,
      sessionKey: 'route:video-1',
    });
  });

  it('builds the session key from the route param instead of the resolved entry video id', () => {
    expect(
      resolveVideoDetailRouteTarget({
        items,
        routeVideoId: null,
      })
    ).toEqual({
      entryIndex: 0,
      entryVideoId: 'video-1',
      sessionKey: 'route:__default__',
    });
  });
});
