import { describe, expect, it } from 'vitest';

import {
  createPlaybackToggleFeedback,
  createRateFeedback,
  createSeekFeedback,
  formatPlaybackFeedbackLabel,
  shouldAutoDismissPlaybackFeedback,
} from './playback-feedback';

describe('playback feedback', () => {
  it('creates playback feedback when the user resumes playback', () => {
    expect(createPlaybackToggleFeedback(false)).toEqual({
      kind: 'playback',
      label: 'Playing',
    });
  });

  it('creates playback feedback when the user pauses playback', () => {
    expect(createPlaybackToggleFeedback(true)).toEqual({
      kind: 'playback',
      label: 'Paused',
    });
  });

  it('formats seek feedback labels for both directions', () => {
    expect(formatPlaybackFeedbackLabel(createSeekFeedback(-5))).toBe('-5s');
    expect(formatPlaybackFeedbackLabel(createSeekFeedback(5))).toBe('+5s');
  });

  it('formats temporary rate feedback labels', () => {
    expect(formatPlaybackFeedbackLabel(createRateFeedback())).toBe('2x');
  });

  it('keeps rate feedback visible until the hold lifecycle clears it', () => {
    expect(shouldAutoDismissPlaybackFeedback(createRateFeedback())).toBe(false);
    expect(
      shouldAutoDismissPlaybackFeedback(createPlaybackToggleFeedback(true))
    ).toBe(true);
    expect(shouldAutoDismissPlaybackFeedback(createSeekFeedback(5))).toBe(true);
  });
});
