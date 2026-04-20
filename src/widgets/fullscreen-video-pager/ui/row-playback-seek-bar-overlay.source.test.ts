import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const source = readFileSync(
  decodeURIComponent(new URL('./row-playback-seek-bar-overlay.tsx', import.meta.url).pathname),
  'utf8'
);

describe('row playback seek bar overlay source', () => {
  it('renders left time, rail and thumb as a presentational control strip without glass', () => {
    expect(source).toContain('displayCurrentTime');
    expect(source).toContain('displayTotalDuration');
    expect(source).toContain('fontVariant: [\'tabular-nums\']');
    expect(source).toContain('railGesture?: GestureType | null');
    expect(source).toContain('isInteractive: boolean;');
    expect(source).toContain('isScrubbing: boolean;');
    expect(source).toContain('resolveSeekBarRailMetrics');
    expect(source).toContain('GestureDetector gesture={railGesture}');
    expect(source).not.toContain('AdaptiveGlass');
    expect(source).not.toContain('useSyncExternalStore');
    expect(source).not.toContain('onRailGesturesChange');
    expect(source).not.toContain('onScrubbingChange');
    expect(source).not.toContain('resolveSeekBarTargetFromRailX');
    expect(source).not.toContain('Gesture.Pan()');
    expect(source).not.toContain('Gesture.Tap()');
  });
});
