import { describe, expect, it } from 'vitest';

import { getFullscreenVideoLoadingState } from './loading-state';

describe('fullscreen video loading state', () => {
  it('shows only the initial bottom loader while the shared list is still empty', () => {
    expect(
      getFullscreenVideoLoadingState({
        itemCount: 0,
        isFetchingNextPage: false,
        isInitialLoading: true,
      })
    ).toEqual({
      showInitialBottomLoader: true,
      showPaginationBottomLoader: false,
    });
  });

  it('shows only the pagination bottom loader when fetching beyond the loaded videos', () => {
    expect(
      getFullscreenVideoLoadingState({
        itemCount: 10,
        isFetchingNextPage: true,
        isInitialLoading: false,
      })
    ).toEqual({
      showInitialBottomLoader: false,
      showPaginationBottomLoader: true,
    });
  });
});
