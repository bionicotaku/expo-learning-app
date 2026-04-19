import { describe, expect, it } from 'vitest';

import type { FeedItem } from '@/entities/feed';
import { createFeedMediaFeatureCardProps } from './media-feature-card-props';

function createFeedItem(overrides: Partial<FeedItem> = {}): FeedItem {
  return {
    id: 'feed-1',
    kind: 'feed-item',
    assetId: 'asset-1',
    uri: 'https://example.com/video.mp4',
    title: 'A useful phrase that still sounds natural in daily conversation.',
    subtitle: 'subtitle',
    page: 1,
    indexInFeed: 0,
    ...overrides,
  };
}

describe('createFeedMediaFeatureCardProps', () => {
  it('maps a feed item into the display props expected by MediaFeatureCard', () => {
    expect(createFeedMediaFeatureCardProps(createFeedItem())).toEqual({
      accessibilityLabel:
        'Open video: A useful phrase that still sounds natural in daily conversation.',
      statsLabel: '7.8k · 1:12',
      tagLabel: 'PHRASAL VERB',
      title: 'A useful phrase that still sounds natural in daily conversation.',
      tone: 'peach',
    });
  });

  it('cycles the visual tone and tag based on the feed index', () => {
    expect(createFeedMediaFeatureCardProps(createFeedItem({ indexInFeed: 4 }))).toMatchObject({
      statsLabel: '9.4k · 2:40',
      tagLabel: 'CASUAL EXPRESSION',
      tone: 'sky',
    });
  });
});
