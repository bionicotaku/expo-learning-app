import { describe, expect, it } from 'vitest';

import { editorialPaperLightTokens } from '@/shared/theme/editorial-paper';

import { resolveAdaptiveGlassAppearance } from './adaptive-glass-appearance';

describe('resolveAdaptiveGlassAppearance', () => {
  it('returns the default editorial-paper glass tokens when appearance is default', () => {
    expect(
      resolveAdaptiveGlassAppearance(editorialPaperLightTokens.glass, 'default')
    ).toEqual({
      glassEffectStyle: 'regular',
      tint: editorialPaperLightTokens.glass.tint,
      intensity: editorialPaperLightTokens.glass.intensity,
      translucentBackground: editorialPaperLightTokens.glass.translucentBackground,
      borderColor: editorialPaperLightTokens.glass.borderColor,
    });
  });

  it('returns a neutral transparent treatment when appearance is clear', () => {
    expect(
      resolveAdaptiveGlassAppearance(editorialPaperLightTokens.glass, 'clear')
    ).toEqual({
      glassEffectStyle: 'clear',
      tint: 'systemChromeMaterial',
      intensity: 72,
      translucentBackground: 'rgba(255,255,255,0.08)',
      borderColor: 'rgba(255,255,255,0.2)',
    });
  });
});
