import { describe, expect, it } from 'vitest';

import {
  shouldDismissToastGesture,
  withToastAlpha,
} from './toast-design';

describe('toast design helpers', () => {
  it('builds the expected alpha composited color', () => {
    expect(withToastAlpha('#34C759', 0.2)).toBe('#34C75933');
    expect(withToastAlpha('#FF3B30', 0.75)).toBe('#FF3B30bf');
  });

  it('dismisses when the upward translation reaches the threshold', () => {
    expect(
      shouldDismissToastGesture({
        translationY: -36,
        velocityY: -100,
      })
    ).toBe(true);
  });

  it('dismisses when the upward fling reaches the threshold', () => {
    expect(
      shouldDismissToastGesture({
        translationY: -8,
        velocityY: -650,
      })
    ).toBe(true);
  });

  it('keeps the toast when the gesture does not reach either threshold', () => {
    expect(
      shouldDismissToastGesture({
        translationY: -20,
        velocityY: -220,
      })
    ).toBe(false);
  });
});
