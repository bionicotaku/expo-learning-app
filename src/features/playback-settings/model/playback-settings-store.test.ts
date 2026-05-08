import { describe, expect, it, afterEach } from 'vitest';

import {
  DEFAULT_ARE_SUBTITLES_VISIBLE,
  DEFAULT_PLAYBACK_RATE,
  PLAYBACK_RATE_OPTIONS,
  usePlaybackSettingsStore,
} from './playback-settings-store';

describe('playback settings store', () => {
  afterEach(() => {
    usePlaybackSettingsStore.getState().resetPlaybackRate();
    usePlaybackSettingsStore.getState().resetSubtitlesVisible();
  });

  it('starts with the default playback rate', () => {
    expect(DEFAULT_PLAYBACK_RATE).toBe(1);
    expect(usePlaybackSettingsStore.getState().playbackRate).toBe(1);
    expect(DEFAULT_ARE_SUBTITLES_VISIBLE).toBe(true);
    expect(usePlaybackSettingsStore.getState().areSubtitlesVisible).toBe(true);
  });

  it('updates the global playback rate in memory', () => {
    usePlaybackSettingsStore.getState().setPlaybackRate(1.5);

    expect(usePlaybackSettingsStore.getState().playbackRate).toBe(1.5);
  });

  it('toggles the global subtitle visibility in memory', () => {
    usePlaybackSettingsStore.getState().toggleSubtitlesVisible();

    expect(usePlaybackSettingsStore.getState().areSubtitlesVisible).toBe(false);

    usePlaybackSettingsStore.getState().toggleSubtitlesVisible();

    expect(usePlaybackSettingsStore.getState().areSubtitlesVisible).toBe(true);
  });

  it('sets and resets the global subtitle visibility', () => {
    usePlaybackSettingsStore.getState().setSubtitlesVisible(false);

    expect(usePlaybackSettingsStore.getState().areSubtitlesVisible).toBe(false);

    usePlaybackSettingsStore.getState().resetSubtitlesVisible();

    expect(usePlaybackSettingsStore.getState().areSubtitlesVisible).toBe(true);
  });

  it('keeps the public playback rate options fixed', () => {
    expect(PLAYBACK_RATE_OPTIONS).toEqual([0.5, 1, 1.5, 2]);
  });
});
