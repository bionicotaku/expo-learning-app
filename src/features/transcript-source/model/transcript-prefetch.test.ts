import { describe, expect, it } from 'vitest';

import type { VideoListItem } from '@/entities/video';

import { resolveTranscriptPrefetchVideoIds } from './transcript-prefetch';

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
  {
    coverImageUrl: null,
    description: 'desc 3',
    durationSeconds: 30,
    isFavorited: false,
    isLiked: false,
    tags: [],
    title: 'Video 3',
    videoId: 'video-3',
    videoUrl: 'https://example.com/3.m3u8',
    viewCount: 3,
  },
];

describe('transcript prefetch', () => {
  it('returns previous and next video ids for a middle active item', () => {
    expect(
      resolveTranscriptPrefetchVideoIds({
        activeIndex: 1,
        items,
      })
    ).toEqual(['video-1', 'video-3']);
  });

  it('returns only the next video for the first item', () => {
    expect(
      resolveTranscriptPrefetchVideoIds({
        activeIndex: 0,
        items,
      })
    ).toEqual(['video-2']);
  });

  it('returns only the previous video for the last item', () => {
    expect(
      resolveTranscriptPrefetchVideoIds({
        activeIndex: 2,
        items,
      })
    ).toEqual(['video-2']);
  });

  it('returns an empty array when there is no active index', () => {
    expect(
      resolveTranscriptPrefetchVideoIds({
        activeIndex: null,
        items,
      })
    ).toEqual([]);
  });

  it('filters duplicates, empty ids, and the active video id itself', () => {
    expect(
      resolveTranscriptPrefetchVideoIds({
        activeIndex: 1,
        items: [
          items[1],
          items[1],
          {
            ...items[1],
            videoId: '',
          },
        ],
      })
    ).toEqual([]);
  });
});
