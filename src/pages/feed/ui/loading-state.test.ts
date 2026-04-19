import { describe, expect, it } from 'vitest';

import { getFeedListLoadingState } from './loading-state';

describe('feed list loading state', () => {
  it('shows only the footer loader during the initial empty-list fetch', () => {
    expect(
      getFeedListLoadingState({
        itemCount: 0,
        isPending: true,
        isFetchingNextPage: false,
      })
    ).toEqual({
      showFooterLoader: true,
    });
  });

  it('shows the same footer loader while appending more cards', () => {
    expect(
      getFeedListLoadingState({
        itemCount: 10,
        isPending: false,
        isFetchingNextPage: true,
      })
    ).toEqual({
      showFooterLoader: true,
    });
  });

  it('does not show the footer loader during pull-to-refresh with existing items', () => {
    expect(
      getFeedListLoadingState({
        itemCount: 10,
        isPending: false,
        isFetchingNextPage: false,
      })
    ).toEqual({
      showFooterLoader: false,
    });
  });
});
