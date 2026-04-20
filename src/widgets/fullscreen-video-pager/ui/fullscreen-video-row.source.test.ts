import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('fullscreen video row source', () => {
  it('mounts row-owned content, row playback HUD, and row surface status as separate sibling layers', () => {
    const source = readFileSync(
      new URL('./fullscreen-video-row.tsx', import.meta.url).pathname,
      'utf8'
    );

    expect(source).toContain('ActiveVideoGestureSurface');
    expect(source).toContain('RowOwnedVideoOverlay');
    expect(source).toContain('RowPlaybackHudOverlay');
    expect(source).toContain('RowSurfaceStatusOverlay');
    expect(source).toContain('onRowUnmount');
    expect(source).toContain('shouldEnableBackgroundGestures ?');
    expect(source).toContain('resolveRowHudCenterOwner');
    expect(source).toContain('shouldReserveCenterForPause');
    expect(source).toContain('showCenteredPause={showCenteredPause}');
    expect(source).toContain('centerOwner={centerOwner}');
  });
});
