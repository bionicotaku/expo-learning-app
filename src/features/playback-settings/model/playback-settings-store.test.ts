import { describe, expect, it, afterEach } from 'vitest';

import {
  DEFAULT_PLAYBACK_RATE,
  DEFAULT_SUBTITLE_DISPLAY_MODE,
  PLAYBACK_RATE_OPTIONS,
  usePlaybackSettingsStore,
} from './playback-settings-store';

describe('playback settings store', () => {
  afterEach(() => {
    usePlaybackSettingsStore.getState().resetPlaybackRate();
    usePlaybackSettingsStore.getState().resetSubtitleDisplayMode();
  });

  it('starts with the default playback rate and subtitle display mode', () => {
    expect(DEFAULT_PLAYBACK_RATE).toBe(1);
    expect(usePlaybackSettingsStore.getState().playbackRate).toBe(1);
    expect(DEFAULT_SUBTITLE_DISPLAY_MODE).toBe('english');
    expect(usePlaybackSettingsStore.getState().subtitleDisplayMode).toBe('english');
  });

  it('updates the global playback rate in memory', () => {
    usePlaybackSettingsStore.getState().setPlaybackRate(1.5);

    expect(usePlaybackSettingsStore.getState().playbackRate).toBe(1.5);
  });

  it('cycles the global subtitle display mode in memory', () => {
    usePlaybackSettingsStore.getState().setSubtitleDisplayMode('off');

    usePlaybackSettingsStore.getState().cycleSubtitleDisplayMode();

    expect(usePlaybackSettingsStore.getState().subtitleDisplayMode).toBe('english');

    usePlaybackSettingsStore.getState().cycleSubtitleDisplayMode();

    expect(usePlaybackSettingsStore.getState().subtitleDisplayMode).toBe('bilingual');

    usePlaybackSettingsStore.getState().cycleSubtitleDisplayMode();

    expect(usePlaybackSettingsStore.getState().subtitleDisplayMode).toBe('off');
  });

  it('sets and resets the global subtitle display mode', () => {
    usePlaybackSettingsStore.getState().setSubtitleDisplayMode('bilingual');

    expect(usePlaybackSettingsStore.getState().subtitleDisplayMode).toBe('bilingual');

    usePlaybackSettingsStore.getState().resetSubtitleDisplayMode();

    expect(usePlaybackSettingsStore.getState().subtitleDisplayMode).toBe('english');
  });

  it('keeps the public playback rate options fixed', () => {
    expect(PLAYBACK_RATE_OPTIONS).toEqual([0.5, 1, 1.5, 2]);
  });
});
