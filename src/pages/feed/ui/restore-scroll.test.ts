import { describe, expect, it } from 'vitest';

import { buildFeedRestoreScrollParams } from './restore-scroll';

describe('feed restore scroll', () => {
  it('uses animated native scrolling when restoring the last played card', () => {
    expect(buildFeedRestoreScrollParams(7)).toEqual({
      animated: true,
      index: 7,
      viewPosition: 0.08,
    });
  });
});
