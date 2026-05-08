import { describe, expect, it, afterEach } from 'vitest';

import {
  DEFAULT_PLAYBACK_RATE,
  PLAYBACK_RATE_OPTIONS,
  usePlaybackSettingsStore,
} from './playback-settings-store';

describe('playback settings store', () => {
  afterEach(() => {
    usePlaybackSettingsStore.getState().resetPlaybackRate();
  });

  it('starts with the default playback rate', () => {
    expect(DEFAULT_PLAYBACK_RATE).toBe(1);
    expect(usePlaybackSettingsStore.getState().playbackRate).toBe(1);
  });

  it('updates the global playback rate in memory', () => {
    usePlaybackSettingsStore.getState().setPlaybackRate(1.5);

    expect(usePlaybackSettingsStore.getState().playbackRate).toBe(1.5);
  });

  it('keeps the public playback rate options fixed', () => {
    expect(PLAYBACK_RATE_OPTIONS).toEqual([0.5, 1, 1.5, 2]);
  });
});
