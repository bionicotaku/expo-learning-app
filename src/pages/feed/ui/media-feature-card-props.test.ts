import { describe, expect, it } from 'vitest';

import type { FeedItem } from '@/entities/feed';
import { createFeedMediaFeatureCardProps } from './media-feature-card-props';

function createFeedItem(overrides: Partial<FeedItem> = {}): FeedItem {
  return {
    videoId: 'the-office-health-care-clip-1',
    title: 'A useful phrase that still sounds natural in daily conversation.',
    description: 'subtitle',
    videoUrl: 'https://example.com/video.m3u8',
    coverImageUrl: 'https://example.com/cover.webp',
    durationSeconds: 72,
    viewCount: 7800,
    tags: ['PHRASAL VERB', 'LISTENING CUE'],
    isLiked: false,
    isFavorited: true,
    ...overrides,
  };
}

describe('createFeedMediaFeatureCardProps', () => {
  it('maps a feed item into the display props expected by MediaFeatureCard', () => {
    expect(createFeedMediaFeatureCardProps(createFeedItem())).toEqual({
      accessibilityLabel:
        'Open video: A useful phrase that still sounds natural in daily conversation.',
      coverImageUrl: 'https://example.com/cover.webp',
      fallbackTone: 'peach',
      statsLabel: '7.8k · 1:12',
      tagLabel: 'PHRASAL VERB',
      title: 'A useful phrase that still sounds natural in daily conversation.',
    });
  });

  it('falls back to a stable tone and default tag when the feed item has no cover or tags', () => {
    expect(
      createFeedMediaFeatureCardProps(
        createFeedItem({
          videoId: 'the-office-health-care-clip-4',
          coverImageUrl: null,
          tags: [],
          viewCount: 12450,
          durationSeconds: 160,
        })
      )
    ).toMatchObject({
      coverImageUrl: null,
      fallbackTone: 'lavender',
      statsLabel: '12.5k · 2:40',
      tagLabel: 'ENGLISH STUDY',
    });
  });
});
