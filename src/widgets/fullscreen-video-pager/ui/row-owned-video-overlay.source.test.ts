import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('row owned video overlay source', () => {
  it('exports the row-owned content overlay as a memoized static layer', () => {
    const source = readFileSync(
      new URL('./row-owned-video-overlay.tsx', import.meta.url).pathname,
      'utf8'
    );

    expect(source).toContain('memo');
    expect(source).toContain('export const RowOwnedVideoOverlay = memo(');
    expect(source).toContain('VideoOverlayActionRail');
    expect(source).toContain('isLiked');
    expect(source).toContain('isFavorited');
  });
});
