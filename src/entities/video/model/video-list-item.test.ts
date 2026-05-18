import { describe, expect, it } from 'vitest';

import type { FeedItem } from '@/entities/feed';
import {
  findVideoListItemIndex,
  mapFeedItemToVideoListItem,
  type VideoListItem,
} from '@/entities/video';

function createFeedItem(overrides: Partial<FeedItem> = {}): FeedItem {
  return {
    video_id: '00000000-0000-4000-8000-000000000001',
    title: 'A practical office phrase you can reuse in real meetings.',
    description: 'Short description',
    video_url: 'https://example.com/video-1.m3u8',
    cover_image_url: 'https://example.com/video-1.webp',
    duration_seconds: 72,
    view_count: 7800,
    like_count: 420,
    favorite_count: 36,
    learning_units: [
      {
        coarse_unit_id: 89008,
        text: 'give',
        role: 'near_future',
        is_primary: true,
        evidence_sentence_index: 15,
        evidence_span_index: 1,
        evidence_start_ms: 31493,
        evidence_end_ms: 31670,
      },
    ],
    ...overrides,
  };
}

describe('video list item entity', () => {
  it('maps a feed item into the canonical video list item shape without dropping fields', () => {
    const mapped = mapFeedItemToVideoListItem(
      createFeedItem(),
      '00000000-0000-4000-8000-000000000000'
    );

    expect(mapped).toEqual<VideoListItem>({
      videoId: '00000000-0000-4000-8000-000000000001',
      title: 'A practical office phrase you can reuse in real meetings.',
      description: 'Short description',
      videoUrl: 'https://example.com/video-1.m3u8',
      coverImageUrl: 'https://example.com/video-1.webp',
      durationSeconds: 72,
      viewCount: 7800,
      likeCount: 420,
      favoriteCount: 36,
      recommendationRunId: '00000000-0000-4000-8000-000000000000',
      learningUnits: [
        {
          coarseUnitId: 89008,
          text: 'give',
          role: 'near_future',
          isPrimary: true,
          evidenceSentenceIndex: 15,
          evidenceSpanIndex: 1,
          evidenceStartMs: 31493,
          evidenceEndMs: 31670,
        },
      ],
    });
    expect(mapped).not.toHaveProperty('tags');
    expect(mapped).not.toHaveProperty('isLiked');
    expect(mapped).not.toHaveProperty('isFavorited');
  });

  it('finds the index of a canonical video item by video id', () => {
    const items = [
      mapFeedItemToVideoListItem(
        createFeedItem(),
        '00000000-0000-4000-8000-000000000000'
      ),
      mapFeedItemToVideoListItem(
        createFeedItem({
          video_id: '00000000-0000-4000-8000-000000000002',
          title: 'Another clip',
        }),
        '00000000-0000-4000-8000-000000000000'
      ),
    ];

    expect(findVideoListItemIndex(items, '00000000-0000-4000-8000-000000000001')).toBe(0);
    expect(findVideoListItemIndex(items, '00000000-0000-4000-8000-000000000002')).toBe(1);
    expect(findVideoListItemIndex(items, 'missing-video')).toBe(-1);
    expect(findVideoListItemIndex(items, null)).toBe(-1);
  });
});
