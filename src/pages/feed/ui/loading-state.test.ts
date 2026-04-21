import { describe, expect, it } from 'vitest';

import { getFeedListLoadingState } from './loading-state';

describe('feed list loading state', () => {
  it('reports the initial loading state while the first snapshot request is pending', () => {
    expect(
      getFeedListLoadingState({
        isPending: true,
        hasItems: false,
        hasError: false,
        isExtending: false,
      })
    ).toEqual({
      kind: 'initial-loading',
    });
  });

  it('reports an error state when the request failed and there is nothing cached', () => {
    expect(
      getFeedListLoadingState({
        isPending: false,
        hasItems: false,
        hasError: true,
        isExtending: false,
      })
    ).toEqual({
      kind: 'error',
    });
  });

  it('reports an empty state after a successful read with no items', () => {
    expect(
      getFeedListLoadingState({
        isPending: false,
        hasItems: false,
        hasError: false,
        isExtending: false,
      })
    ).toEqual({
      kind: 'empty',
    });
  });

  it('reports success whenever at least one item is already on screen', () => {
    expect(
      getFeedListLoadingState({
        isPending: true,
        hasItems: true,
        hasError: false,
        isExtending: true,
      })
    ).toEqual({
      kind: 'success',
      showFooterLoader: true,
    });
  });
});
