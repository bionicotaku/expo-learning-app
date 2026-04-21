import { describe, expect, it } from 'vitest';

import { resolveInitialFullscreenPagerPosition } from './initial-positioning';

describe('resolveInitialFullscreenPagerPosition', () => {
  it('uses initialScrollIndex when the pager mounted with items already available', () => {
    expect(
      resolveInitialFullscreenPagerPosition({
        entryIndex: 3,
        itemCount: 8,
        mountedWithItems: true,
        hasCompletedPostLoadAlignment: false,
      })
    ).toEqual({
      initialScrollIndex: 3,
      targetIndex: 3,
      shouldRunPostLoadAlignment: false,
    });
  });

  it('does not use initialScrollIndex when the pager mounted with an empty list', () => {
    expect(
      resolveInitialFullscreenPagerPosition({
        entryIndex: 4,
        itemCount: 8,
        mountedWithItems: false,
        hasCompletedPostLoadAlignment: false,
      })
    ).toEqual({
      initialScrollIndex: undefined,
      targetIndex: 4,
      shouldRunPostLoadAlignment: true,
    });
  });

  it('does not request post-load alignment after it has already completed once', () => {
    expect(
      resolveInitialFullscreenPagerPosition({
        entryIndex: 4,
        itemCount: 8,
        mountedWithItems: false,
        hasCompletedPostLoadAlignment: true,
      })
    ).toEqual({
      initialScrollIndex: undefined,
      targetIndex: 4,
      shouldRunPostLoadAlignment: false,
    });
  });

  it('clamps out-of-range indices to the available list bounds', () => {
    expect(
      resolveInitialFullscreenPagerPosition({
        entryIndex: 99,
        itemCount: 5,
        mountedWithItems: true,
        hasCompletedPostLoadAlignment: false,
      })
    ).toEqual({
      initialScrollIndex: 4,
      targetIndex: 4,
      shouldRunPostLoadAlignment: false,
    });
  });

  it('falls back to index zero while the list is still empty', () => {
    expect(
      resolveInitialFullscreenPagerPosition({
        entryIndex: 7,
        itemCount: 0,
        mountedWithItems: false,
        hasCompletedPostLoadAlignment: false,
      })
    ).toEqual({
      initialScrollIndex: undefined,
      targetIndex: 0,
      shouldRunPostLoadAlignment: false,
    });
  });
});
