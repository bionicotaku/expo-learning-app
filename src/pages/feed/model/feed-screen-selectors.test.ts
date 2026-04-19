import { describe, expect, it } from 'vitest';

import type { FeedItem } from '@/entities/feed';

import {
  buildFeedScreenItems,
  getFeedDebugLabel,
  getFeedOverlayModel,
} from './feed-screen-selectors';

const baseItem: FeedItem = {
  id: 'feed-1',
  kind: 'feed-item',
  assetId: 'asset-1',
  uri: 'https://example.com/1.mp4',
  title: 'Clip 01',
  subtitle: 'Page 1 · Remote MP4 stream',
  page: 1,
  indexInFeed: 0,
};

describe('feed screen selectors', () => {
  it('appends a loading tail item while the next page is being fetched', () => {
    expect(buildFeedScreenItems([baseItem], true)).toEqual([
      baseItem,
      {
        id: 'feed-loading-tail-1',
        kind: 'loading-tail',
      },
    ]);
  });

  it('reports the correct debug label for the active slot', () => {
    expect(getFeedDebugLabel(10, 10)).toBe('11 / 10');
  });

  it('builds the default overlay model for a muted feed item', () => {
    expect(getFeedOverlayModel(baseItem, true)).toEqual({
      title: 'Clip 01',
      subtitle: 'Page 1 · Remote MP4 stream',
      hint: 'Tap anywhere to unmute',
    });
  });

  it('builds the loading overlay model for the tail item', () => {
    expect(
      getFeedOverlayModel(
        {
          id: 'feed-loading-tail-10',
          kind: 'loading-tail',
        },
        false
      )
    ).toEqual({
      title: 'Loading next page...',
      subtitle: 'Simulated 3 second network delay',
      hint: null,
    });
  });
});
