import { describe, expect, it } from 'vitest';

import {
  createTransientHoldState,
  isGestureLocked,
  resolveBasePausedByUserAfterActiveChange,
  resolveEffectivePlaybackState,
  resolveFullscreenHoldZone,
  resolveFullscreenTapZone,
  resolveTransientHoldStateAfterActiveChange,
  toggleBasePlaybackPausedByUser,
} from './playback-session';

describe('playback session', () => {
  it('resolves the double-tap zone from a left-right split', () => {
    expect(resolveFullscreenTapZone(149, 300)).toBe('left');
    expect(resolveFullscreenTapZone(150, 300)).toBe('right');
  });

  it('resolves the long-press zone from a left-center-right split', () => {
    expect(resolveFullscreenHoldZone(99, 300)).toBe('left');
    expect(resolveFullscreenHoldZone(100, 300)).toBe('center');
    expect(resolveFullscreenHoldZone(199, 300)).toBe('center');
    expect(resolveFullscreenHoldZone(200, 300)).toBe('right');
  });

  it('auto-plays the active row by default', () => {
    expect(
      resolveEffectivePlaybackState({
        activeIndex: 4,
        basePausedByUser: false,
        itemIndex: 4,
        transientHoldState: null,
      })
    ).toEqual({
      isGestureLocked: false,
      playbackRate: 1,
      shouldPlay: true,
    });
  });

  it('does not play a row when the user paused the current session', () => {
    expect(
      resolveEffectivePlaybackState({
        activeIndex: 4,
        basePausedByUser: true,
        itemIndex: 4,
        transientHoldState: null,
      })
    ).toEqual({
      isGestureLocked: false,
      playbackRate: 1,
      shouldPlay: false,
    });
  });

  it('forces temporary 2x playback during a left or right hold even when the base state is paused', () => {
    expect(
      resolveEffectivePlaybackState({
        activeIndex: 4,
        basePausedByUser: true,
        itemIndex: 4,
        transientHoldState: createTransientHoldState({
          basePausedByUser: true,
          zone: 'left',
        }),
      })
    ).toEqual({
      isGestureLocked: true,
      playbackRate: 2,
      shouldPlay: true,
    });
  });

  it('keeps the base playback state during a center hold while still locking other gestures', () => {
    expect(
      resolveEffectivePlaybackState({
        activeIndex: 4,
        basePausedByUser: true,
        itemIndex: 4,
        transientHoldState: createTransientHoldState({
          basePausedByUser: true,
          zone: 'center',
        }),
      })
    ).toEqual({
      isGestureLocked: true,
      playbackRate: 1,
      shouldPlay: false,
    });
  });

  it('never plays rows that are not active even if the active row is in a speed hold', () => {
    expect(
      resolveEffectivePlaybackState({
        activeIndex: 4,
        basePausedByUser: false,
        itemIndex: 3,
        transientHoldState: createTransientHoldState({
          basePausedByUser: false,
          zone: 'right',
        }),
      })
    ).toEqual({
      isGestureLocked: true,
      playbackRate: 1,
      shouldPlay: false,
    });
  });

  it('toggles the base paused flag when the background is tapped', () => {
    expect(toggleBasePlaybackPausedByUser(false)).toBe(true);
    expect(toggleBasePlaybackPausedByUser(true)).toBe(false);
  });

  it('captures whether a temporary hold resumed from a paused base state', () => {
    expect(
      createTransientHoldState({
        basePausedByUser: true,
        zone: 'right',
      })
    ).toEqual({
      resumedFromPause: true,
      zone: 'right',
    });
  });

  it('resets the base paused state when the active row changes', () => {
    expect(
      resolveBasePausedByUserAfterActiveChange({
        currentActiveIndex: 4,
        nextActiveIndex: 5,
        basePausedByUser: true,
      })
    ).toBe(false);
  });

  it('keeps the current paused state when the active row did not change', () => {
    expect(
      resolveBasePausedByUserAfterActiveChange({
        currentActiveIndex: 4,
        nextActiveIndex: 4,
        basePausedByUser: true,
      })
    ).toBe(true);
  });

  it('clears the transient hold state when the active row changes', () => {
    expect(
      resolveTransientHoldStateAfterActiveChange({
        currentActiveIndex: 4,
        nextActiveIndex: 5,
        transientHoldState: createTransientHoldState({
          basePausedByUser: false,
          zone: 'left',
        }),
      })
    ).toBeNull();
  });

  it('reports gesture lock whenever any transient hold is active', () => {
    expect(
      isGestureLocked(
        createTransientHoldState({
          basePausedByUser: false,
          zone: 'center',
        })
      )
    ).toBe(true);
    expect(isGestureLocked(null)).toBe(false);
  });
});
