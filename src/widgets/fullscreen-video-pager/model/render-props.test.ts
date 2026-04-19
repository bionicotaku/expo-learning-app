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
          isMuted: true,
          shouldUsePlayer: true,
          videoId: 'feed-4',
          width: 393,
        },
        {
          height: 852,
          isActive: true,
          isMuted: true,
          shouldUsePlayer: true,
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
          isMuted: true,
          shouldUsePlayer: true,
          videoId: 'feed-4',
          width: 393,
        },
        {
          height: 852,
          isActive: false,
          isMuted: true,
          shouldUsePlayer: true,
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
          isActive: true,
          isMuted: true,
          videoId: 'feed-4',
        },
        {
          isActive: true,
          isMuted: true,
          videoId: 'feed-4',
        }
      )
    ).toBe(true);
  });

  it('re-renders the player surface when muted state changes', () => {
    expect(
      arePlayableVideoSurfacePropsEqual(
        {
          isActive: true,
          isMuted: true,
          videoId: 'feed-4',
        },
        {
          isActive: true,
          isMuted: false,
          videoId: 'feed-4',
        }
      )
    ).toBe(false);
  });
});
