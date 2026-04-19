import type { BlurTint } from 'expo-blur';

import type { EditorialPaperTokens } from '@/shared/theme/editorial-paper';

import type { AdaptiveGlassProps } from './types';

type AdaptiveGlassAppearance = NonNullable<AdaptiveGlassProps['appearance']>;

type ResolvedAdaptiveGlassAppearance = {
  borderColor: string;
  glassEffectStyle: 'clear' | 'regular';
  intensity: number;
  tint: BlurTint;
  translucentBackground: string;
};

export function resolveAdaptiveGlassAppearance(
  glassTokens: EditorialPaperTokens['glass'],
  appearance: AdaptiveGlassAppearance
): ResolvedAdaptiveGlassAppearance {
  if (appearance === 'clear') {
    return {
      glassEffectStyle: 'clear',
      tint: 'systemChromeMaterial',
      intensity: 72,
      translucentBackground: 'rgba(255,255,255,0.08)',
      borderColor: 'rgba(255,255,255,0.2)',
    };
  }

  return {
    glassEffectStyle: 'regular',
    tint: glassTokens.tint,
    intensity: glassTokens.intensity,
    translucentBackground: glassTokens.translucentBackground,
    borderColor: glassTokens.borderColor,
  };
}
