import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('row playback media layer source', () => {
  it('owns the player surface and seek bar store wiring with active-only progress binding', () => {
    const source = readFileSync(
      new URL('./row-playback-media-layer.tsx', import.meta.url).pathname,
      'utf8'
    );

    expect(source).toContain('PlayableVideoSurface');
    expect(source).toContain('seekBarStore');
    expect(source).toContain('registerSeekController');
    expect(source).not.toContain('RowPlaybackProgressOverlay');
    expect(source).not.toContain('const [progressSnapshot, setProgressSnapshot]');
    expect(source).toContain('onActiveProgressSnapshotChange={isActive ? setProgressSnapshot : undefined}');
    expect(source).toContain('seekBarStore.setProgressSnapshot');
    expect(source).toContain('seekBarStore.setSeekController');
    expect(source).toContain('if (isActive && shouldUsePlayer) {');
    expect(source).not.toContain('if (!shouldUsePlayer) {');
    expect(source).not.toContain('if (!isActive) {');
    expect(source).toContain('seekBarStore.clear();');
  });
});
