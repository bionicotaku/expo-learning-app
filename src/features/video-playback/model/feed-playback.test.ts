import { describe, expect, it } from 'vitest';

import { createFeedPlaybackState, feedPlaybackReducer } from './feed-playback';

describe('feedPlaybackReducer', () => {
  it('starts from the first slot with muted audio and no active item id', () => {
    expect(createFeedPlaybackState()).toEqual({
      activeItemId: null,
      activeIndex: 0,
      isMuted: true,
    });
  });

  it('keeps mute state when the active feed item changes', () => {
    const unmutedState = feedPlaybackReducer(createFeedPlaybackState(), {
      type: 'toggle-muted',
    });

    expect(
      feedPlaybackReducer(unmutedState, {
        type: 'set-active-item',
        itemId: 'feed-8',
        index: 7,
      })
    ).toEqual({
      activeItemId: 'feed-8',
      activeIndex: 7,
      isMuted: false,
    });
  });
});
