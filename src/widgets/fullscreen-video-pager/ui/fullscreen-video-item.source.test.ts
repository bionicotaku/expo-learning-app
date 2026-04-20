import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('fullscreen video item source', () => {
  it('mounts the gesture surface only for the active row instead of disabling inactive rows', () => {
    const source = readFileSync(
      new URL('./fullscreen-video-item.tsx', import.meta.url).pathname,
      'utf8'
    );

    expect(source).toContain('ActiveVideoGestureSurface');
    expect(source).toContain('shouldEnableBackgroundGestures ? (');
    expect(source).not.toContain('disabled={!isActive}');
  });
});
