import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const source = readFileSync(
  decodeURIComponent(new URL('./row-playback-hud-overlay.tsx', import.meta.url).pathname),
  'utf8'
);

describe('RowPlaybackHudOverlay source', () => {
  it('renders pause, seek, and rate HUDs with the established glass treatments', () => {
    expect(source).toContain('RowHudAnchors');
    expect(source).toContain('showCenteredPause');
    expect(source).toContain('play.fill');
    expect(source).toContain('backward.fill');
    expect(source).toContain('forward.fill');
    expect(source).toContain('speedometer');
    expect(source).toContain('FadeIn');
    expect(source).toContain('FadeOut');
    expect(source).not.toContain('Playing');
    expect(source).not.toContain('Paused');
  });
});
