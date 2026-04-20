import { describe, expect, it } from 'vitest';

import {
  areFullscreenVideoRowRenderPropsEqual,
  arePlayableVideoSurfacePropsEqual,
} from './render-props';

describe('fullscreen video render props', () => {
  it('keeps the row stable when only unrelated parent state changes', () => {
    expect(
      areFullscreenVideoRowRenderPropsEqual(
        {
          height: 852,
          hudPauseIndicatorVisible: false,
          hudTransientFeedbackKind: null,
          hudTransientSeekDeltaSeconds: null,
          isActive: true,
          playbackRate: 1,
          shouldEnableBackgroundGestures: true,
          shouldUsePlayer: true,
          shouldPlay: true,
          videoId: 'feed-4',
          width: 393,
        },
        {
          height: 852,
          hudPauseIndicatorVisible: false,
          hudTransientFeedbackKind: null,
          hudTransientSeekDeltaSeconds: null,
          isActive: true,
          playbackRate: 1,
          shouldEnableBackgroundGestures: true,
          shouldUsePlayer: true,
          shouldPlay: true,
          videoId: 'feed-4',
          width: 393,
        }
      )
    ).toBe(true);
  });

  it('re-renders the row when active state changes', () => {
    expect(
      areFullscreenVideoRowRenderPropsEqual(
        {
          height: 852,
          hudPauseIndicatorVisible: false,
          hudTransientFeedbackKind: null,
          hudTransientSeekDeltaSeconds: null,
          isActive: true,
          playbackRate: 1,
          shouldEnableBackgroundGestures: true,
          shouldUsePlayer: true,
          shouldPlay: true,
          videoId: 'feed-4',
          width: 393,
        },
        {
          height: 852,
          hudPauseIndicatorVisible: false,
          hudTransientFeedbackKind: null,
          hudTransientSeekDeltaSeconds: null,
          isActive: false,
          playbackRate: 1,
          shouldEnableBackgroundGestures: false,
          shouldUsePlayer: true,
          shouldPlay: false,
          videoId: 'feed-4',
          width: 393,
        }
      )
    ).toBe(false);
  });

  it('re-renders the row when background gesture availability changes for the active item', () => {
    expect(
      areFullscreenVideoRowRenderPropsEqual(
        {
          height: 852,
          hudPauseIndicatorVisible: false,
          hudTransientFeedbackKind: null,
          hudTransientSeekDeltaSeconds: null,
          isActive: true,
          playbackRate: 1,
          shouldEnableBackgroundGestures: true,
          shouldUsePlayer: true,
          shouldPlay: true,
          videoId: 'feed-4',
          width: 393,
        },
        {
          height: 852,
          hudPauseIndicatorVisible: false,
          hudTransientFeedbackKind: null,
          hudTransientSeekDeltaSeconds: null,
          isActive: true,
          playbackRate: 1,
          shouldEnableBackgroundGestures: false,
          shouldUsePlayer: true,
          shouldPlay: true,
          videoId: 'feed-4',
          width: 393,
        }
      )
    ).toBe(false);
  });

  it('re-renders the row when pause indicator visibility changes', () => {
    expect(
      areFullscreenVideoRowRenderPropsEqual(
        {
          height: 852,
          hudPauseIndicatorVisible: false,
          hudTransientFeedbackKind: null,
          hudTransientSeekDeltaSeconds: null,
          isActive: true,
          playbackRate: 1,
          shouldEnableBackgroundGestures: true,
          shouldUsePlayer: true,
          shouldPlay: true,
          videoId: 'feed-4',
          width: 393,
        },
        {
          height: 852,
          hudPauseIndicatorVisible: true,
          hudTransientFeedbackKind: null,
          hudTransientSeekDeltaSeconds: null,
          isActive: true,
          playbackRate: 1,
          shouldEnableBackgroundGestures: true,
          shouldUsePlayer: true,
          shouldPlay: true,
          videoId: 'feed-4',
          width: 393,
        }
      )
    ).toBe(false);
  });

  it('re-renders the row when transient feedback kind changes', () => {
    expect(
      areFullscreenVideoRowRenderPropsEqual(
        {
          height: 852,
          hudPauseIndicatorVisible: false,
          hudTransientFeedbackKind: null,
          hudTransientSeekDeltaSeconds: null,
          isActive: true,
          playbackRate: 1,
          shouldEnableBackgroundGestures: true,
          shouldUsePlayer: true,
          shouldPlay: true,
          videoId: 'feed-4',
          width: 393,
        },
        {
          height: 852,
          hudPauseIndicatorVisible: false,
          hudTransientFeedbackKind: 'rate',
          hudTransientSeekDeltaSeconds: null,
          isActive: true,
          playbackRate: 1,
          shouldEnableBackgroundGestures: true,
          shouldUsePlayer: true,
          shouldPlay: true,
          videoId: 'feed-4',
          width: 393,
        }
      )
    ).toBe(false);
  });

  it('re-renders the row when seek delta changes', () => {
    expect(
      areFullscreenVideoRowRenderPropsEqual(
        {
          height: 852,
          hudPauseIndicatorVisible: false,
          hudTransientFeedbackKind: 'seek',
          hudTransientSeekDeltaSeconds: -5,
          isActive: true,
          playbackRate: 1,
          shouldEnableBackgroundGestures: true,
          shouldUsePlayer: true,
          shouldPlay: true,
          videoId: 'feed-4',
          width: 393,
        },
        {
          height: 852,
          hudPauseIndicatorVisible: false,
          hudTransientFeedbackKind: 'seek',
          hudTransientSeekDeltaSeconds: 5,
          isActive: true,
          playbackRate: 1,
          shouldEnableBackgroundGestures: true,
          shouldUsePlayer: true,
          shouldPlay: true,
          videoId: 'feed-4',
          width: 393,
        }
      )
    ).toBe(false);
  });

  it('keeps the player surface stable unless playback-relevant props change', () => {
    expect(
      arePlayableVideoSurfacePropsEqual(
        {
          playbackRate: 1,
          shouldPlay: true,
          videoId: 'feed-4',
        },
        {
          playbackRate: 1,
          shouldPlay: true,
          videoId: 'feed-4',
        }
      )
    ).toBe(true);
  });

  it('re-renders the player surface when playback intent changes', () => {
    expect(
      arePlayableVideoSurfacePropsEqual(
        {
          playbackRate: 1,
          shouldPlay: true,
          videoId: 'feed-4',
        },
        {
          playbackRate: 1,
          shouldPlay: false,
          videoId: 'feed-4',
        }
      )
    ).toBe(false);
  });

  it('re-renders the player surface when playback rate changes during a temporary hold', () => {
    expect(
      arePlayableVideoSurfacePropsEqual(
        {
          playbackRate: 1,
          shouldPlay: true,
          videoId: 'feed-4',
        },
        {
          playbackRate: 2,
          shouldPlay: true,
          videoId: 'feed-4',
        }
      )
    ).toBe(false);
  });
});
