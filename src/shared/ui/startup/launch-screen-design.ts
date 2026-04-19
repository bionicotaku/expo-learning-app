import type { EditorialPaperTokens } from '@/shared/theme/editorial-paper';

export type LaunchScreenDesign = {
  backgroundColor: string;
  radialHighlightColor: string;
  wordmark: {
    label: string;
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    letterSpacing: number;
    color: string;
  };
  symbol: {
    width: number;
    height: number;
    outerColor: string;
    outerBorderColor: string;
    outerShadow: string;
    notchSize: number;
    innerWidth: number;
    innerHeight: number;
    innerColor: string;
  };
  spacing: {
    symbolToWordmark: number;
  };
  motion: {
    loopDurationMs: number;
    minimumScale: number;
    maximumScale: number;
    minimumInnerOpacity: number;
    maximumInnerOpacity: number;
  };
  chrome: {
    showsSubtitle: false;
    showsProgressIndicator: false;
  };
};

export function createLaunchScreenDesign(
  tokens: EditorialPaperTokens
): LaunchScreenDesign {
  return {
    backgroundColor: tokens.color.background,
    radialHighlightColor: 'rgba(200, 90, 44, 0.06)',
    wordmark: {
      label: 'learnability',
      fontFamily: tokens.typography.display.fontFamily,
      fontSize: 34,
      lineHeight: 36,
      letterSpacing: -0.8,
      color: tokens.color.ink,
    },
    symbol: {
      width: 64,
      height: 88,
      outerColor: '#FBF7EE',
      outerBorderColor: 'rgba(255, 255, 255, 0.72)',
      outerShadow:
        '0px 18px 34px rgba(142, 107, 69, 0.14), 0px -6px 16px rgba(255, 255, 255, 0.68)',
      notchSize: 18,
      innerWidth: 22,
      innerHeight: 34,
      innerColor: tokens.color.gold,
    },
    spacing: {
      symbolToWordmark: 22,
    },
    motion: {
      loopDurationMs: 3600,
      minimumScale: 0.985,
      maximumScale: 1.015,
      minimumInnerOpacity: 0.24,
      maximumInnerOpacity: 0.42,
    },
    chrome: {
      showsSubtitle: false,
      showsProgressIndicator: false,
    },
  };
}
