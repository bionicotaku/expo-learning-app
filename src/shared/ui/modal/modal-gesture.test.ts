import { describe, expect, it } from 'vitest';

import { shouldDismissSheetGesture } from './modal-gesture';

describe('modal gesture helpers', () => {
  it('dismisses a sheet when the downward translation reaches the threshold', () => {
    expect(
      shouldDismissSheetGesture({
        translationY: 120,
        velocityY: 200,
      })
    ).toBe(true);
  });

  it('dismisses a sheet when the downward fling reaches the threshold', () => {
    expect(
      shouldDismissSheetGesture({
        translationY: 32,
        velocityY: 900,
      })
    ).toBe(true);
  });

  it('keeps the sheet open when neither threshold is reached', () => {
    expect(
      shouldDismissSheetGesture({
        translationY: 48,
        velocityY: 320,
      })
    ).toBe(false);
  });
});
