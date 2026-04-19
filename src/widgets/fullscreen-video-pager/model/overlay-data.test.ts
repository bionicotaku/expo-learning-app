import { describe, expect, it } from 'vitest';

import {
  formatFullscreenVideoCounterLabel,
  fullscreenVideoOverlayActionItems,
} from './overlay-data';

describe('fullscreen overlay data', () => {
  it('defines the four action rail items in a stable order', () => {
    expect(fullscreenVideoOverlayActionItems.map((item) => item.id)).toEqual([
      'favorite',
      'save',
      'share',
      'annotate',
    ]);
  });

  it('formats the top chrome counter from the active item index', () => {
    expect(formatFullscreenVideoCounterLabel(0, 8)).toBe('1 / 8');
    expect(formatFullscreenVideoCounterLabel(3, 8)).toBe('4 / 8');
    expect(formatFullscreenVideoCounterLabel(null, 8)).toBeNull();
  });
});
