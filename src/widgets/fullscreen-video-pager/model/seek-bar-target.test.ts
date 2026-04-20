import { describe, expect, it } from 'vitest';

import { resolveSeekBarTargetFromRailX } from './seek-bar-target';

describe('resolveSeekBarTargetFromRailX', () => {
  it('clamps to the left edge', () => {
    expect(resolveSeekBarTargetFromRailX(-20, 200, 100)).toEqual({
      ratio: 0,
      targetSeconds: 0,
    });
  });

  it('resolves the midpoint', () => {
    expect(resolveSeekBarTargetFromRailX(100, 200, 100)).toEqual({
      ratio: 0.5,
      targetSeconds: 50,
    });
  });

  it('clamps to the right edge', () => {
    expect(resolveSeekBarTargetFromRailX(260, 200, 100)).toEqual({
      ratio: 1,
      targetSeconds: 100,
    });
  });
});
