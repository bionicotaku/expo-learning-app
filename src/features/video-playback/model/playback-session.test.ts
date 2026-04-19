import { describe, expect, it } from 'vitest';

import {
  resolvePausedByUserAfterActiveChange,
  shouldPlayVideo,
  togglePlaybackPausedByUser,
} from './playback-session';

describe('playback session', () => {
  it('auto-plays the active row by default', () => {
    expect(
      shouldPlayVideo({
        activeIndex: 4,
        itemIndex: 4,
        pausedByUser: false,
      })
    ).toBe(true);
  });

  it('does not play a row when the user paused the current session', () => {
    expect(
      shouldPlayVideo({
        activeIndex: 4,
        itemIndex: 4,
        pausedByUser: true,
      })
    ).toBe(false);
  });

  it('never plays rows that are not active', () => {
    expect(
      shouldPlayVideo({
        activeIndex: 4,
        itemIndex: 3,
        pausedByUser: false,
      })
    ).toBe(false);
  });

  it('toggles the paused flag when the background is tapped', () => {
    expect(togglePlaybackPausedByUser(false)).toBe(true);
    expect(togglePlaybackPausedByUser(true)).toBe(false);
  });

  it('resets manual pause when the active row changes', () => {
    expect(
      resolvePausedByUserAfterActiveChange({
        currentActiveIndex: 4,
        nextActiveIndex: 5,
        pausedByUser: true,
      })
    ).toBe(false);
  });

  it('keeps the current paused state when the active row did not change', () => {
    expect(
      resolvePausedByUserAfterActiveChange({
        currentActiveIndex: 4,
        nextActiveIndex: 4,
        pausedByUser: true,
      })
    ).toBe(true);
  });
});
