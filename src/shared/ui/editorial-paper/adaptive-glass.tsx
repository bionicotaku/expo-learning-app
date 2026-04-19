import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';

import { resolveAdaptiveGlassAppearance } from './adaptive-glass-appearance';
import { resolveEditorialPaperGlassSupport } from './glass-support';
import type { AdaptiveGlassProps } from './types';

function resolveVariantPadding(variant: NonNullable<AdaptiveGlassProps['variant']>) {
  switch (variant) {
    case 'pill':
      return 8;
    case 'chrome':
      return 10;
    case 'overlay':
    default:
      return 12;
  }
}

export function AdaptiveGlass({
  children,
  appearance = 'default',
  variant = 'overlay',
  interactive = false,
  fallbackMode = 'auto',
  radius = 18,
  style,
  ...viewProps
}: AdaptiveGlassProps) {
  const { tokens } = useEditorialPaperTheme();
  const appearanceTokens = resolveAdaptiveGlassAppearance(tokens.glass, appearance);
  const isWeb = process.env.EXPO_OS === 'web';
  const support = resolveEditorialPaperGlassSupport({
    isWeb,
    platformOs: isWeb ? 'web' : process.env.EXPO_OS === 'android' ? 'android' : 'ios',
    liquidGlassAvailable: isLiquidGlassAvailable(),
    blurAvailable: fallbackMode !== 'translucent',
  });
  const mode = fallbackMode === 'auto' ? support.mode : fallbackMode;
  const baseSurfaceStyle: ViewStyle = {
    borderRadius: radius,
    borderCurve: 'continuous',
    overflow: 'hidden',
    padding: resolveVariantPadding(variant),
    borderWidth: 1,
    borderColor: appearanceTokens.borderColor,
  };
  const baseStyle = [
    baseSurfaceStyle,
    style,
  ];

  if (mode === 'glass' && !isWeb) {
    return (
      <GlassView
        glassEffectStyle={appearanceTokens.glassEffectStyle}
        isInteractive={interactive}
        style={baseStyle}
        {...viewProps}
      >
        {children}
      </GlassView>
    );
  }

  if (mode === 'blur' && !isWeb) {
    return (
      <BlurView
        tint={appearanceTokens.tint}
        intensity={appearanceTokens.intensity}
        style={baseStyle}
        {...viewProps}
      >
        {children}
      </BlurView>
    );
  }

  return (
    <View
      style={[
        {
          backgroundColor: appearanceTokens.translucentBackground,
        },
        ...baseStyle,
      ]}
      {...viewProps}
    >
      {children}
    </View>
  );
}
