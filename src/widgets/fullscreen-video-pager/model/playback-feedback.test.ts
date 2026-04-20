import { describe, expect, it } from 'vitest';

import {
  createRateFeedback,
  createSeekFeedback,
  shouldAutoDismissPlaybackFeedback,
} from './playback-feedback';

describe('playback feedback', () => {
  it('keeps the feedback union limited to seek and rate states', () => {
    expect(createSeekFeedback(-5)).toEqual({
      deltaSeconds: -5,
      kind: 'seek',
    });
    expect(createRateFeedback()).toEqual({
      kind: 'rate',
      label: '2x',
    });
  });

  it('keeps rate feedback visible until the hold lifecycle clears it', () => {
    expect(shouldAutoDismissPlaybackFeedback(createRateFeedback())).toBe(false);
    expect(shouldAutoDismissPlaybackFeedback(createSeekFeedback(5))).toBe(true);
  });
});
