import { describe, expect, it } from 'vitest';

import { resolveSeekBarControlLaneFrame, resolveSeekBarRailMetrics } from './seek-bar-layout';

describe('seek bar layout', () => {
  it('computes a stable control lane frame from width and bottom inset', () => {
    expect(resolveSeekBarControlLaneFrame({ bottomInset: 34, width: 393 })).toEqual({
      bottom: 46,
      height: 28,
      left: 22,
      right: 22,
      top: 74,
      width: 349,
    });
  });

  it('computes rail metrics from shared layout constants', () => {
    expect(resolveSeekBarRailMetrics(393)).toEqual({
      railWidth: 237,
      leftInset: 22,
      rightInset: 22,
    });
  });
});
