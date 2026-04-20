import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const source = readFileSync(
  decodeURIComponent(new URL('./row-playback-interaction-layer.tsx', import.meta.url).pathname),
  'utf8'
);

describe('row playback interaction layer source', () => {
  it('co-locates background gestures and seek bar lane under one interaction owner', () => {
    expect(source).toContain('BackgroundGestureRegion');
    expect(source).toContain('SeekBarControlLane');
    expect(source).toContain('RowPlaybackSeekBarOverlay');
    expect(source).toContain('useSyncExternalStore');
    expect(source).toContain('Gesture.Exclusive(longPress, doubleTap)');
    expect(source).toContain('Pressable');
    expect(source).toContain('const [isScrubbing, setIsScrubbing]');
    expect(source).not.toContain('externalGestureBlockers');
    expect(source).not.toContain('onRailGesturesChange');
    expect(source).not.toContain('SeekBarGestureBlockers');
  });

  it('keeps the background region geometrically above the seek bar control lane', () => {
    expect(source).toContain('resolveSeekBarControlLaneFrame');
    expect(source).toContain('bottom={controlLaneFrame.top}');
  });
});
