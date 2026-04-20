import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  decodeURIComponent(
    new URL('./active-video-gesture-surface.tsx', import.meta.url).pathname
  ),
  'utf8'
);

describe('ActiveVideoGestureSurface source', () => {
  it('runs tap and long-press callbacks on the JS thread explicitly', () => {
    expect(source.match(/\.runOnJS\(true\)/g)).toHaveLength(2);
  });

  it('does not leave a timing dead zone between single tap and long press', () => {
    expect(source).toContain('requireExternalGestureToFail');
    expect(source).not.toContain('const singleTapMaxDurationMs');
  });

  it('uses a Pressable-style single tap that waits for double tap and long press to fail', () => {
    expect(source).toContain('Pressable');
    expect(source).toContain('requireExternalGestureToFail');
  });
});
