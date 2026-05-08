import { describe, expect, it } from 'vitest';

import {
  formatFullscreenVideoCounterLabel,
  fullscreenVideoOverlayActionItems,
} from './overlay-data';

describe('fullscreen overlay data', () => {
  it('defines the visible action rail items in a stable order without fullscreen share', () => {
    expect(fullscreenVideoOverlayActionItems.map((item) => item.id)).toEqual([
      'like',
      'favorite',
      'subtitle',
    ]);
    expect(fullscreenVideoOverlayActionItems.map((item) => item.iosSymbol)).not.toContain(
      'square.and.arrow.up'
    );
  });

  it('formats the top chrome counter from the active item index', () => {
    expect(formatFullscreenVideoCounterLabel(0, 8)).toBe('1 / 8');
    expect(formatFullscreenVideoCounterLabel(3, 8)).toBe('4 / 8');
    expect(formatFullscreenVideoCounterLabel(null, 8)).toBeNull();
  });
});
