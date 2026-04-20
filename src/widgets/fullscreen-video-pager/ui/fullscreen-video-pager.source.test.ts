import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('fullscreen video pager source', () => {
  it('keeps a wider virtualization window around the active video', () => {
    const source = readFileSync(
      new URL('./fullscreen-video-pager.tsx', import.meta.url).pathname,
      'utf8'
    );

    expect(source).toContain('initialNumToRender={5}');
    expect(source).toContain('maxToRenderPerBatch={6}');
    expect(source).toContain('windowSize={7}');
    expect(source).not.toContain('GestureDetector');
  });

  it('clears the active player controller and surface state before switching rows', () => {
    const source = readFileSync(
      new URL('./fullscreen-video-pager.tsx', import.meta.url).pathname,
      'utf8'
    );

    expect(source).toContain('activePlayerControllerRef.current = null');
    expect(source).toContain('setActiveSurfaceState(null)');
  });

  it('splits paused state indication from transient seek and rate feedback', () => {
    const source = readFileSync(
      new URL('./fullscreen-video-pager.tsx', import.meta.url).pathname,
      'utf8'
    );

    expect(source).toContain('PausedPlaybackIndicatorOverlay');
    expect(source).not.toContain('createPlaybackToggleFeedback');
  });

  it('auto-dismisses the pause indicator after a short visibility window', () => {
    const source = readFileSync(
      new URL('./fullscreen-video-pager.tsx', import.meta.url).pathname,
      'utf8'
    );

    expect(source).toContain('pauseIndicatorVisibilityDurationMs = 3000');
    expect(source).toContain('pauseIndicatorTimeoutRef');
    expect(source).toContain('setIsPauseIndicatorVisible(true)');
    expect(source).toContain('setIsPauseIndicatorVisible(false)');
  });
});
