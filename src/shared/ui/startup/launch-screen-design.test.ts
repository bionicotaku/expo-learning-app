import { describe, expect, it } from 'vitest';

import { editorialPaperLightTokens } from '@/shared/theme/editorial-paper';

import { createLaunchScreenDesign } from './launch-screen-design';

describe('launch screen design', () => {
  it('uses the editorial paper background and learnability wordmark', () => {
    expect(createLaunchScreenDesign(editorialPaperLightTokens)).toMatchObject({
      backgroundColor: editorialPaperLightTokens.color.background,
      wordmark: {
        label: 'learnability',
        color: editorialPaperLightTokens.color.ink,
        fontSize: 34,
        lineHeight: 36,
        letterSpacing: -0.8,
      },
    });
  });

  it('defines the abstract symbol size and spacing', () => {
    expect(createLaunchScreenDesign(editorialPaperLightTokens)).toMatchObject({
      symbol: {
        width: 64,
        height: 88,
      },
      spacing: {
        symbolToWordmark: 22,
      },
    });
  });

  it('keeps the restrained motion envelope stable', () => {
    expect(createLaunchScreenDesign(editorialPaperLightTokens)).toMatchObject({
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
    });
  });
});
