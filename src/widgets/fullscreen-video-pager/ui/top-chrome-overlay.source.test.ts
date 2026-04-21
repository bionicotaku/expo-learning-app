import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('top chrome overlay source', () => {
  it('keeps only the counter chrome and removes the back button chain', () => {
    const source = readFileSync(
      new URL('./top-chrome-overlay.tsx', import.meta.url).pathname,
      'utf8'
    );

    expect(source).toContain('formatFullscreenVideoCounterLabel');
    expect(source).not.toContain('accessibilityLabel="Back"');
    expect(source).not.toContain('onPressBack');
  });
});
