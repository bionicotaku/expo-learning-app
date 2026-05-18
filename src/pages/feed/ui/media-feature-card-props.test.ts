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
      {
        coarseUnitId: 138446,
        text: 'sacred',
        role: 'new_now',
        isPrimary: false,
        evidenceSentenceIndex: 14,
        evidenceSpanIndex: 17,
        evidenceStartMs: 17621,
        evidenceEndMs: 30899,
      },
      {
        coarseUnitId: 72360,
        text: 'earlier',
        role: 'new_now',
        isPrimary: false,
        evidenceSentenceIndex: 13,
        evidenceSpanIndex: 5,
        evidenceStartMs: 16659,
        evidenceEndMs: 16868,
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
      tagLabel: 'give, sacred, earlier',
      title: 'A useful phrase that still sounds natural in daily conversation.',
    });
  });

  it('omits later learning units with an ellipsis when the tag label exceeds the maximum length', () => {
    expect(
      createVideoMediaFeatureCardProps(
        createVideoListItem({
          learningUnits: [
            ...createVideoListItem().learningUnits,
            {
              coarseUnitId: 37192,
              text: 'acupuncture',
              role: 'soft_review',
              isPrimary: false,
              evidenceSentenceIndex: 27,
              evidenceSpanIndex: 7,
              evidenceStartMs: 69032,
              evidenceEndMs: 75044,
            },
            {
              coarseUnitId: 109520,
              text: 'massage',
              role: 'hard_review',
              isPrimary: false,
              evidenceSentenceIndex: 27,
              evidenceSpanIndex: 9,
              evidenceStartMs: 69032,
              evidenceEndMs: 75044,
            },
          ],
        })
      )
    ).toMatchObject({
      tagLabel: 'give, sacred, earlier, acupuncture...',
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
