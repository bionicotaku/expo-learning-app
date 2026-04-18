import { describe, expect, it, vi } from 'vitest';

import { VIDEO_ASSETS } from '@/entities/video';

import { createMockFeedPage, fetchMockFeedPage } from './mock-feed';

describe('mock feed page', () => {
  it('creates ten unique feed items with continuous ids and asset rotation', () => {
    const page = createMockFeedPage({ offset: 10, limit: 10 });

    expect(page).toHaveLength(10);
    expect(page[0]).toMatchObject({
      id: 'feed-11',
      assetId: VIDEO_ASSETS[0].assetId,
      page: 2,
      indexInFeed: 10,
    });
    expect(page[4]).toMatchObject({
      id: 'feed-15',
      assetId: VIDEO_ASSETS[4].assetId,
    });
    expect(page[5]).toMatchObject({
      id: 'feed-16',
      assetId: VIDEO_ASSETS[0].assetId,
    });
    expect(new Set(page.map((item) => item.id)).size).toBe(10);
  });

  it('resolves after the configured network delay', async () => {
    vi.useFakeTimers();

    let resolved = false;
    const request = fetchMockFeedPage({ offset: 0, limit: 10, delayMs: 3000 }).then((page) => {
      resolved = true;
      return page;
    });

    await vi.advanceTimersByTimeAsync(2999);
    expect(resolved).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await expect(request).resolves.toHaveLength(10);

    vi.useRealTimers();
  });
});
