import { describe, expect, it } from 'vitest';

import { shouldMountPlayer } from './player-window';

describe('shouldMountPlayer', () => {
  it('keeps players mounted for the current item and the nearest two items on each side', () => {
    expect(shouldMountPlayer(6, 8)).toBe(true);
    expect(shouldMountPlayer(7, 8)).toBe(true);
    expect(shouldMountPlayer(8, 8)).toBe(true);
    expect(shouldMountPlayer(9, 8)).toBe(true);
    expect(shouldMountPlayer(10, 8)).toBe(true);
    expect(shouldMountPlayer(5, 8)).toBe(false);
    expect(shouldMountPlayer(11, 8)).toBe(false);
  });
});
