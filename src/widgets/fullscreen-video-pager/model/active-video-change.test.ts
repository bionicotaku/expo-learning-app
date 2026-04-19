import { describe, expect, it } from 'vitest';

import { resolveActiveVideoChange } from './active-video-change';

describe('resolveActiveVideoChange', () => {
  it('returns the next active item when the visible item changed', () => {
    expect(
      resolveActiveVideoChange({
        currentActiveIndex: 2,
        currentActiveItemId: 'feed-3',
        viewableItems: [
          {
            index: 3,
            isViewable: true,
            item: { id: 'feed-4' },
          },
        ],
      })
    ).toEqual({
      index: 3,
      itemId: 'feed-4',
    });
  });

  it('returns null when the active item did not actually change', () => {
    expect(
      resolveActiveVideoChange({
        currentActiveIndex: 3,
        currentActiveItemId: 'feed-4',
        viewableItems: [
          {
            index: 3,
            isViewable: true,
            item: { id: 'feed-4' },
          },
        ],
      })
    ).toBeNull();
  });

  it('returns null when there is no valid visible item', () => {
    expect(
      resolveActiveVideoChange({
        currentActiveIndex: 3,
        currentActiveItemId: 'feed-4',
        viewableItems: [
          {
            index: null,
            isViewable: false,
            item: null,
          },
        ],
      })
    ).toBeNull();
  });
});
