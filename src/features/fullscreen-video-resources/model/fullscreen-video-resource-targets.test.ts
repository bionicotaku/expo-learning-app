import { describe, expect, it } from 'vitest';

import type { VideoListItem } from '@/entities/video';

import { resolveFullscreenVideoResourceTargetIds } from './fullscreen-video-resource-targets';

const items: VideoListItem[] = [
  {
    coverImageUrl: null,
    description: 'desc 1',
    durationSeconds: 10,
    favoriteCount: 1,
    likeCount: 10,
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
    favoriteCount: 2,
    likeCount: 20,
    tags: [],
    title: 'Video 2',
    videoId: 'video-2',
    videoUrl: 'https://example.com/2.m3u8',
    viewCount: 2,
  },
  {
    coverImageUrl: null,
    description: 'desc 3',
    durationSeconds: 30,
    favoriteCount: 3,
    likeCount: 30,
    tags: [],
    title: 'Video 3',
    videoId: 'video-3',
    videoUrl: 'https://example.com/3.m3u8',
    viewCount: 3,
  },
];

describe('fullscreen video resource targets', () => {
  it('returns active minus one, active, and active plus one video ids', () => {
    expect(
      resolveFullscreenVideoResourceTargetIds({
        activeIndex: 1,
        items,
      })
    ).toEqual(['video-1', 'video-2', 'video-3']);
  });

  it('deduplicates ids and filters empty entries', () => {
    expect(
      resolveFullscreenVideoResourceTargetIds({
        activeIndex: 1,
        items: [
          items[1]!,
          items[1]!,
          {
            ...items[2]!,
            videoId: '',
          },
        ],
      })
    ).toEqual(['video-2']);
  });

  it('returns an empty array when active index is missing', () => {
    expect(
      resolveFullscreenVideoResourceTargetIds({
        activeIndex: null,
        items,
      })
    ).toEqual([]);
  });
});
