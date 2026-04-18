import { describe, expect, it } from 'vitest';

import { shouldMountPlayer } from './player-window';

describe('shouldMountPlayer', () => {
  it('keeps players mounted only for the current, previous, and next slots', () => {
    expect(shouldMountPlayer(7, 8)).toBe(true);
    expect(shouldMountPlayer(8, 8)).toBe(true);
    expect(shouldMountPlayer(9, 8)).toBe(true);
    expect(shouldMountPlayer(6, 8)).toBe(false);
    expect(shouldMountPlayer(10, 8)).toBe(false);
  });
});
