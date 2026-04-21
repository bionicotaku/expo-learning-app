import { describe, expect, it } from 'vitest';

import { resolveAuthPageShellLayout } from './layout';

describe('resolveAuthPageShellLayout', () => {
  it('uses a compact shell on common phone heights', () => {
    expect(resolveAuthPageShellLayout(852)).toEqual({
      displayFontSize: 44,
      displayLineHeight: 43,
      displayLetterSpacing: -1.4,
      subtitleMarginTop: 12,
      cardMarginTop: 24,
      footerPaddingTop: 12,
    });
  });

  it('keeps the roomier shell on taller screens', () => {
    expect(resolveAuthPageShellLayout(932)).toEqual({
      displayFontSize: 48,
      displayLineHeight: 47,
      displayLetterSpacing: -1.6,
      subtitleMarginTop: 16,
      cardMarginTop: 30,
      footerPaddingTop: 16,
    });
  });
});
