import { describe, expect, it } from 'vitest';

import {
  clearFullscreenRowTransientFeedback,
  getFullscreenRowPlaybackHudState,
  hideFullscreenRowPauseIndicator,
  setFullscreenRowTransientFeedback,
  showFullscreenRowPauseIndicator,
} from './row-playback-hud-state';

describe('row playback hud state', () => {
  it('stores pause visibility and transient feedback independently for the same video', () => {
    const withPause = showFullscreenRowPauseIndicator({}, 'feed-1');
    const withSeek = setFullscreenRowTransientFeedback(withPause, 'feed-1', {
      kind: 'seek',
      deltaSeconds: -5,
    });

    expect(getFullscreenRowPlaybackHudState(withSeek, 'feed-1')).toEqual({
      pauseIndicatorVisible: true,
      transientFeedback: {
        kind: 'seek',
        deltaSeconds: -5,
      },
    });
  });

  it('replaces seek with rate without clearing the pause slot', () => {
    const withPause = showFullscreenRowPauseIndicator({}, 'feed-1');
    const withSeek = setFullscreenRowTransientFeedback(withPause, 'feed-1', {
      kind: 'seek',
      deltaSeconds: 5,
    });
    const withRate = setFullscreenRowTransientFeedback(withSeek, 'feed-1', {
      kind: 'rate',
      label: '2x',
    });

    expect(getFullscreenRowPlaybackHudState(withRate, 'feed-1')).toEqual({
      pauseIndicatorVisible: true,
      transientFeedback: {
        kind: 'rate',
        label: '2x',
      },
    });
  });

  it('clearing one slot does not delete the other slot for the same row', () => {
    const withPause = showFullscreenRowPauseIndicator({}, 'feed-1');
    const withSeek = setFullscreenRowTransientFeedback(withPause, 'feed-1', {
      kind: 'seek',
      deltaSeconds: 5,
    });
    const withoutSeek = clearFullscreenRowTransientFeedback(withSeek, 'feed-1');

    expect(getFullscreenRowPlaybackHudState(withoutSeek, 'feed-1')).toEqual({
      pauseIndicatorVisible: true,
      transientFeedback: null,
    });

    const withoutPause = hideFullscreenRowPauseIndicator(withSeek, 'feed-1');
    expect(getFullscreenRowPlaybackHudState(withoutPause, 'feed-1')).toEqual({
      pauseIndicatorVisible: false,
      transientFeedback: {
        kind: 'seek',
        deltaSeconds: 5,
      },
    });
  });

  it('prunes the row entry when both pause and transient feedback are cleared', () => {
    const withPause = showFullscreenRowPauseIndicator({}, 'feed-1');
    const withSeek = setFullscreenRowTransientFeedback(withPause, 'feed-1', {
      kind: 'seek',
      deltaSeconds: -5,
    });
    const withoutPause = hideFullscreenRowPauseIndicator(withSeek, 'feed-1');
    const pruned = clearFullscreenRowTransientFeedback(withoutPause, 'feed-1');

    expect(pruned).toEqual({});
  });
});
