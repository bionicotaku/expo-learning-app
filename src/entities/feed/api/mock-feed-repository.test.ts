import { describe, expect, it, vi } from 'vitest';

import { VIDEO_ASSETS } from '@/entities/video';

import { createMockFeedPage, fetchMockFeedPage } from './mock-feed-repository';

describe('mock feed repository', () => {
  it('creates a page result with continuous feed ids, rotated assets, and next offset metadata', () => {
    const page = createMockFeedPage({ offset: 10, limit: 10 });

    expect(page.items).toHaveLength(10);
    expect(page.nextOffset).toBe(20);
    expect(page.hasMore).toBe(true);
    expect(page.items[0]).toMatchObject({
      id: 'feed-11',
      kind: 'feed-item',
      assetId: VIDEO_ASSETS[0].assetId,
      page: 2,
      indexInFeed: 10,
    });
    expect(page.items[4]).toMatchObject({
      id: 'feed-15',
      assetId: VIDEO_ASSETS[4].assetId,
    });
    expect(page.items[5]).toMatchObject({
      id: 'feed-16',
      assetId: VIDEO_ASSETS[0].assetId,
    });
    expect(new Set(page.items.map((item) => item.id)).size).toBe(10);
  });

  it('resolves after the configured mock network delay', async () => {
    vi.useFakeTimers();

    let resolved = false;
    const request = fetchMockFeedPage({ offset: 0, limit: 10, delayMs: 3000 }).then((page) => {
      resolved = true;
      return page;
    });

    await vi.advanceTimersByTimeAsync(2999);
    expect(resolved).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await expect(request).resolves.toMatchObject({
      nextOffset: 10,
      hasMore: true,
    });

    vi.useRealTimers();
  });
});
