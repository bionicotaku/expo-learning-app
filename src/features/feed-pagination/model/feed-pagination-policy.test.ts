import { describe, expect, it } from 'vitest';

import { shouldPrefetchNextPage } from './feed-pagination-policy';

describe('feed pagination policy', () => {
  it('starts prefetching when the current item reaches the eighth slot in a ten item page', () => {
    expect(
      shouldPrefetchNextPage({
        activeIndex: 7,
        loadedCount: 10,
        isFetchingNextPage: false,
        hasNextPage: true,
      })
    ).toBe(true);
  });

  it('does not start a second request while a next page request is already in flight', () => {
    expect(
      shouldPrefetchNextPage({
        activeIndex: 8,
        loadedCount: 10,
        isFetchingNextPage: true,
        hasNextPage: true,
      })
    ).toBe(false);
  });

  it('does not prefetch once the feed reports there is no next page', () => {
    expect(
      shouldPrefetchNextPage({
        activeIndex: 8,
        loadedCount: 10,
        isFetchingNextPage: false,
        hasNextPage: false,
      })
    ).toBe(false);
  });
});
