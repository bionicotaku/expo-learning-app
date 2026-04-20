import { describe, expect, it } from 'vitest';

import { getFullscreenVideoLoadingState } from './loading-state';

describe('fullscreen video loading state', () => {
  it('shows only the initial bottom loader while the shared list is still empty', () => {
    expect(
      getFullscreenVideoLoadingState({
        itemCount: 0,
        isInitialLoading: true,
      })
    ).toEqual({
      showInitialBottomLoader: true,
    });
  });

  it('hides the bottom loader once the first snapshot has loaded', () => {
    expect(
      getFullscreenVideoLoadingState({
        itemCount: 8,
        isInitialLoading: false,
      })
    ).toEqual({
      showInitialBottomLoader: false,
    });
  });
});
