import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const source = readFileSync(
  new URL('./playable-video-surface.tsx', import.meta.url).pathname,
  'utf8'
);

describe('playable video surface source', () => {
  it('registers the active player controller synchronously with the current surface state', () => {
    expect(source).toContain('useLayoutEffect');
    expect(source).toContain('registerActiveController');
    expect(source).toContain('registerSeekController');
    expect(source).toContain('surfaceState:');
    expect(source).toContain('onActiveProgressSnapshotChange');
    expect(source).toContain('timeUpdateEventInterval = onActiveProgressSnapshotChange ? 0.25 : 0');
    expect(source).toContain("useEventListener(player, 'timeUpdate'");
    expect(source).toContain('scheduleProgressResync');
    expect(source).toContain('const seekTo = useCallback');
    expect(source).toContain('player.currentTime = seconds;');
    expect(source).toContain(
      'previousProps.onActiveProgressSnapshotChange ==='
    );
    expect(source).toContain(
      'previousProps.registerActiveController === nextProps.registerActiveController'
    );
    expect(source).not.toContain('onActiveProgressSnapshotChange?.(null)');
    expect(source).not.toContain('player.timeUpdateEventInterval = 0;');
  });

  it('keeps retry declarative and stops rendering loading and error presenters itself', () => {
    expect(source).toContain('onSurfacePresentationChange');
    expect(source).toContain('void player.replaceAsync(video.videoUrl);');
    expect(source).toContain('allowsVideoFrameAnalysis={false}');
    expect(source).not.toContain('ActivityIndicator');
    expect(source).not.toContain('AdaptiveGlass');
    expect(source).not.toContain('Video unavailable');
    expect(source).not.toContain('await player.replaceAsync(video.videoUrl);');
    expect(source).not.toContain("await player.replaceAsync(video.videoUrl);\n\n    if (shouldPlay) {");
  });
});
