import { describe, expect, it } from 'vitest';

import { getPlaybackFeedbackLabel } from './playback-feedback';

describe('playback feedback', () => {
  it('shows Playing when the user resumes playback', () => {
    expect(getPlaybackFeedbackLabel(false)).toBe('Playing');
  });

  it('shows Paused when the user pauses playback', () => {
    expect(getPlaybackFeedbackLabel(true)).toBe('Paused');
  });
});
