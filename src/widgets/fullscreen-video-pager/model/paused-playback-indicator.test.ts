import { describe, expect, it } from 'vitest';

import { shouldShowPausedPlaybackIndicator } from './paused-playback-indicator';

describe('paused playback indicator', () => {
  it('shows only when there is an active row, the player surface is usable, and effective playback is paused', () => {
    expect(
      shouldShowPausedPlaybackIndicator({
        activeItemId: 'video-1',
        activeSurfaceState: 'ready',
        shouldPlay: false,
      })
    ).toBe(true);

    expect(
      shouldShowPausedPlaybackIndicator({
        activeItemId: 'video-1',
        activeSurfaceState: 'ready',
        shouldPlay: true,
      })
    ).toBe(false);

    expect(
      shouldShowPausedPlaybackIndicator({
        activeItemId: 'video-1',
        activeSurfaceState: 'error',
        shouldPlay: false,
      })
    ).toBe(false);

    expect(
      shouldShowPausedPlaybackIndicator({
        activeItemId: null,
        activeSurfaceState: 'ready',
        shouldPlay: false,
      })
    ).toBe(false);
  });
});
