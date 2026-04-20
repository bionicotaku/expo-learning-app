import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('video overlay action button source', () => {
  it('supports active-state tinting without changing the glass shell owner', () => {
    const source = readFileSync(
      new URL('./video-overlay-action-button.tsx', import.meta.url).pathname,
      'utf8'
    );

    expect(source).toContain('isActive');
    expect(source).toContain('activeTintColor');
    expect(source).toContain('const resolvedTintColor');
    expect(source).toContain('AdaptiveGlass');
  });
});
