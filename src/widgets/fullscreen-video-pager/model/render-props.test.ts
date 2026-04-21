import { describe, expect, it } from 'vitest';

import type { FullscreenVideoRowRenderProps } from './render-props';
import {
  areFullscreenVideoRowRenderPropsEqual,
  arePlayableVideoSurfacePropsEqual,
} from './render-props';

const baseRowRenderProps: FullscreenVideoRowRenderProps = {
  activeVisitToken: 1,
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
};

describe('fullscreen video render props', () => {
  it('keeps the row stable when only unrelated parent state changes', () => {
    expect(
      areFullscreenVideoRowRenderPropsEqual(baseRowRenderProps, {
        ...baseRowRenderProps,
      })
    ).toBe(true);
  });

  it('re-renders the row when active state changes', () => {
    expect(
      areFullscreenVideoRowRenderPropsEqual(baseRowRenderProps, {
        ...baseRowRenderProps,
        isActive: false,
        shouldEnableBackgroundGestures: false,
        shouldPlay: false,
      })
    ).toBe(false);
  });

  it('re-renders the row when a new active visit token arrives', () => {
    expect(
      areFullscreenVideoRowRenderPropsEqual(baseRowRenderProps, {
        ...baseRowRenderProps,
        activeVisitToken: 2,
      })
    ).toBe(false);
  });

  it('re-renders the row when background gesture availability changes for the active item', () => {
    expect(
      areFullscreenVideoRowRenderPropsEqual(baseRowRenderProps, {
        ...baseRowRenderProps,
        shouldEnableBackgroundGestures: false,
      })
    ).toBe(false);
  });

  it('re-renders the row when pause indicator visibility changes', () => {
    expect(
      areFullscreenVideoRowRenderPropsEqual(baseRowRenderProps, {
        ...baseRowRenderProps,
        hudPauseIndicatorVisible: true,
      })
    ).toBe(false);
  });

  it('re-renders the row when transient feedback kind changes', () => {
    expect(
      areFullscreenVideoRowRenderPropsEqual(baseRowRenderProps, {
        ...baseRowRenderProps,
        hudTransientFeedbackKind: 'rate',
      })
    ).toBe(false);
  });

  it('re-renders the row when seek delta changes', () => {
    expect(
      areFullscreenVideoRowRenderPropsEqual(
        {
          ...baseRowRenderProps,
          hudTransientFeedbackKind: 'seek',
          hudTransientSeekDeltaSeconds: -5,
        },
        {
          ...baseRowRenderProps,
          hudTransientFeedbackKind: 'seek',
          hudTransientSeekDeltaSeconds: 5,
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

  it('keeps the pager-level row compare free of progress snapshot concerns', () => {
    expect(
      areFullscreenVideoRowRenderPropsEqual(baseRowRenderProps, {
        ...baseRowRenderProps,
      })
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
