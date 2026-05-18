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
      tagLabel: 'give',
      title: 'A useful phrase that still sounds natural in daily conversation.',
    });
  });

  it('falls back to a stable tone and default tag when the feed item has no cover or learning units', () => {
    expect(
      createVideoMediaFeatureCardProps(
        createVideoListItem({
          videoId: 'the-office-health-care-clip-4',
          coverImageUrl: null,
          learningUnits: [],
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
