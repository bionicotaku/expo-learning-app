import { describe, expect, it } from 'vitest';

import { resolveActivePlayerSurfaceState } from './active-player-controller';

describe('active player controller', () => {
  it('maps ready, error, and non-ready player statuses onto the widget surface state contract', () => {
    expect(resolveActivePlayerSurfaceState('readyToPlay')).toBe('ready');
    expect(resolveActivePlayerSurfaceState('error')).toBe('error');
    expect(resolveActivePlayerSurfaceState('loading')).toBe('loading');
    expect(resolveActivePlayerSurfaceState('idle')).toBe('loading');
  });
});
