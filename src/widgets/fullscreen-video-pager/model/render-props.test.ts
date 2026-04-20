import { describe, expect, it } from 'vitest';

import {
  areFullscreenVideoItemRenderPropsEqual,
  arePlayableVideoSurfacePropsEqual,
} from './render-props';

describe('fullscreen video render props', () => {
  it('keeps the row stable when only unrelated parent state changes', () => {
    expect(
      areFullscreenVideoItemRenderPropsEqual(
        {
          height: 852,
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
      areFullscreenVideoItemRenderPropsEqual(
        {
          height: 852,
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
      areFullscreenVideoItemRenderPropsEqual(
        {
          height: 852,
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
