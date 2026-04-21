import { describe, expect, it } from 'vitest';

import {
  resolveRowHudCenterOwner,
  shouldReserveCenterForPause,
} from './row-hud-layout';

describe('row hud layout', () => {
  it('keeps pause as the center owner while pause is visible', () => {
    expect(
      resolveRowHudCenterOwner({
        pauseExitReserved: false,
        pauseVisible: true,
        surfaceState: 'loading',
      })
    ).toBe('pause');
  });

  it('keeps pause as the center owner while fade-out reservation is active', () => {
    expect(
      resolveRowHudCenterOwner({
        pauseExitReserved: true,
        pauseVisible: false,
        surfaceState: 'loading',
      })
    ).toBe('pause');
  });

  it('hands the center slot back to loading after pause reservation ends', () => {
    expect(
      resolveRowHudCenterOwner({
        pauseExitReserved: false,
        pauseVisible: false,
        surfaceState: 'loading',
      })
    ).toBe('loading');
  });

  it('never lets loading override a visible pause owner', () => {
    expect(
      resolveRowHudCenterOwner({
        pauseExitReserved: false,
        pauseVisible: true,
        surfaceState: 'loading',
      })
    ).not.toBe('loading');
  });

  it('does not reserve the center slot for seek or rate feedback on their own', () => {
    expect(
      shouldReserveCenterForPause({
        pauseVisible: false,
        transientFeedbackKind: 'seek',
      })
    ).toBe(false);
    expect(
      shouldReserveCenterForPause({
        pauseVisible: false,
        transientFeedbackKind: 'rate',
      })
    ).toBe(false);
  });
});
