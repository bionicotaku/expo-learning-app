import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const source = readFileSync(
  decodeURIComponent(
    new URL('./paused-playback-indicator-overlay.tsx', import.meta.url).pathname
  ),
  'utf8'
);

describe('PausedPlaybackIndicatorOverlay source', () => {
  it('renders a dedicated center pause indicator with a smaller glass circle and play symbol', () => {
    expect(source).toContain('AdaptiveGlass');
    expect(source).toContain('FadeIn');
    expect(source).toContain('FadeOut');
    expect(source).toContain('play.fill');
    expect(source).toContain("pointerEvents=\"none\"");
  });
});
