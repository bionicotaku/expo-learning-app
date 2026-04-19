import { describe, expect, it } from 'vitest';

import { fetchFeedPage } from '@/entities/feed';

describe('feed repository facade', () => {
  it('keeps the public feed page contract stable', async () => {
    const page = await fetchFeedPage({
      offset: 10,
      limit: 10,
    });

    expect(page.nextOffset).toBe(20);
    expect(page.hasMore).toBe(true);
    expect(page.items[0]).toMatchObject({
      id: 'feed-11',
      indexInFeed: 10,
    });
  });
});
