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
    expect(source).toContain('surfaceState:');
    expect(source).toContain(
      'previousProps.registerActiveController === nextProps.registerActiveController'
    );
  });

  it('stops rendering loading and error presenters itself and emits surface presentation upstream', () => {
    expect(source).toContain('onSurfacePresentationChange');
    expect(source).not.toContain('ActivityIndicator');
    expect(source).not.toContain('AdaptiveGlass');
    expect(source).not.toContain('Video unavailable');
  });
});
