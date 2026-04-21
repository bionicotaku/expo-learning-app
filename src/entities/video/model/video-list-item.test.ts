import { describe, expect, it } from 'vitest';

import type { FeedItem } from '@/entities/feed';
import {
  findVideoListItemIndex,
  mapFeedItemToVideoListItem,
  type VideoListItem,
} from '@/entities/video';

function createFeedItem(overrides: Partial<FeedItem> = {}): FeedItem {
  return {
    videoId: 'the-office-health-care-video-1',
    title: 'A practical office phrase you can reuse in real meetings.',
    description: 'Short description',
    videoUrl: 'https://example.com/video-1.m3u8',
    coverImageUrl: 'https://example.com/video-1.webp',
    durationSeconds: 72,
    viewCount: 7800,
    tags: ['PHRASAL VERB', 'LISTENING CUE'],
    isLiked: true,
    isFavorited: false,
    ...overrides,
  };
}

describe('video list item entity', () => {
  it('maps a feed item into the canonical video list item shape without dropping fields', () => {
    const mapped = mapFeedItemToVideoListItem(createFeedItem());

    expect(mapped).toEqual<VideoListItem>({
      videoId: 'the-office-health-care-video-1',
      title: 'A practical office phrase you can reuse in real meetings.',
      description: 'Short description',
      videoUrl: 'https://example.com/video-1.m3u8',
      coverImageUrl: 'https://example.com/video-1.webp',
      durationSeconds: 72,
      viewCount: 7800,
      tags: ['PHRASAL VERB', 'LISTENING CUE'],
      isLiked: true,
      isFavorited: false,
    });
  });

  it('finds the index of a canonical video item by video id', () => {
    const items = [
      mapFeedItemToVideoListItem(createFeedItem()),
      mapFeedItemToVideoListItem(
        createFeedItem({
          videoId: 'the-office-health-care-video-2',
          title: 'Another clip',
        })
      ),
    ];

    expect(findVideoListItemIndex(items, 'the-office-health-care-video-1')).toBe(0);
    expect(findVideoListItemIndex(items, 'the-office-health-care-video-2')).toBe(1);
    expect(findVideoListItemIndex(items, 'missing-video')).toBe(-1);
    expect(findVideoListItemIndex(items, null)).toBe(-1);
  });
});
