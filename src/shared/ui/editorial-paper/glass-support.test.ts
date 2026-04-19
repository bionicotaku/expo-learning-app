import { describe, expect, it } from 'vitest';

import { resolveEditorialPaperGlassSupport } from './glass-support';

describe('resolveEditorialPaperGlassSupport', () => {
  it('prefers liquid glass when it is available on iOS', () => {
    expect(
      resolveEditorialPaperGlassSupport({
        isWeb: false,
        platformOs: 'ios',
        liquidGlassAvailable: true,
        blurAvailable: true,
      })
    ).toEqual({
      mode: 'glass',
      interactive: true,
    });
  });

  it('falls back to blur when glass is unavailable on native', () => {
    expect(
      resolveEditorialPaperGlassSupport({
        isWeb: false,
        platformOs: 'android',
        liquidGlassAvailable: false,
        blurAvailable: true,
      })
    ).toEqual({
      mode: 'blur',
      interactive: false,
    });
  });

  it('falls back to translucent view when neither native effect is available', () => {
    expect(
      resolveEditorialPaperGlassSupport({
        isWeb: true,
        platformOs: 'web',
        liquidGlassAvailable: false,
        blurAvailable: false,
      })
    ).toEqual({
      mode: 'translucent',
      interactive: false,
    });
  });
});
