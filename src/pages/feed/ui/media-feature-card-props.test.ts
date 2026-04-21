import { describe, expect, it } from 'vitest';

import type { VideoListItem } from '@/entities/video';
import { createVideoMediaFeatureCardProps } from './media-feature-card-props';

function createVideoListItem(overrides: Partial<VideoListItem> = {}): VideoListItem {
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

describe('createVideoMediaFeatureCardProps', () => {
  it('maps a canonical video item into the display props expected by MediaFeatureCard', () => {
    expect(createVideoMediaFeatureCardProps(createVideoListItem())).toEqual({
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
      createVideoMediaFeatureCardProps(
        createVideoListItem({
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
