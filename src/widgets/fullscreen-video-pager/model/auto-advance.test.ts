import { describe, expect, it } from 'vitest';

import { resolveNextFullscreenVideoIndex } from './auto-advance';

describe('fullscreen pager auto advance', () => {
  it('returns the next index when the active video has a loaded successor', () => {
    expect(resolveNextFullscreenVideoIndex({
      activeIndex: 0,
      itemCount: 2,
    })).toBe(1);
  });

  it('returns null at the loaded list bottom', () => {
    expect(resolveNextFullscreenVideoIndex({
      activeIndex: 1,
      itemCount: 2,
    })).toBeNull();
  });
});
