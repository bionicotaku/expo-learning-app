import { describe, expect, it } from 'vitest';

import { createLoadingSentinel, getDebugCounterLabel, shouldLoadMore } from './pagination-helpers';

describe('pagination helpers', () => {
  it('starts loading when the current item reaches the eighth slot in a ten item page', () => {
    expect(
      shouldLoadMore({
        activeIndex: 7,
        loadedCount: 10,
        isAppending: false,
        hasMore: true,
      })
    ).toBe(true);
  });

  it('does not start a second request while a page append is already in flight', () => {
    expect(
      shouldLoadMore({
        activeIndex: 8,
        loadedCount: 10,
        isAppending: true,
        hasMore: true,
      })
    ).toBe(false);
  });

  it('creates a loading sentinel and reports debug counters for it', () => {
    expect(createLoadingSentinel(10)).toEqual({
      id: 'loading-sentinel-10',
      kind: 'loading-sentinel',
    });
    expect(getDebugCounterLabel(10, 10)).toBe('11 / 10');
  });
});
