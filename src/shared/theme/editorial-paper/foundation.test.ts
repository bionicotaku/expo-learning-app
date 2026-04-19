import { existsSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  editorialPaperCjkTitleFontAssetPath,
  editorialPaperCjkTitleFontFamily,
  createEditorialPaperThemeContextValue,
  editorialPaperDisplayFontAssetPath,
  editorialPaperDisplayFontFamily,
  editorialPaperLightTokens,
} from './index';

describe('Editorial Paper foundation', () => {
  it('defines the expected light-only token structure', () => {
    expect(editorialPaperLightTokens).toMatchObject({
      color: {
        background: expect.any(String),
        surface: expect.any(String),
        ink: expect.any(String),
        inkSoft: expect.any(String),
        inkMute: expect.any(String),
        accent: expect.any(String),
        gold: expect.any(String),
        cocoa: expect.any(String),
        softAction: {
          rose: expect.any(String),
          peach: expect.any(String),
          butter: expect.any(String),
          pistachio: expect.any(String),
          lavender: expect.any(String),
          sky: expect.any(String),
        },
      },
      typography: {
        display: expect.any(Object),
        title: expect.any(Object),
        body: expect.any(Object),
        meta: expect.any(Object),
      },
      spacing: expect.any(Object),
      radius: expect.any(Object),
      elevation: expect.any(Object),
      glass: expect.any(Object),
    });
    expect(editorialPaperLightTokens).not.toHaveProperty('dark');
  });

  it('exposes the local title font assets', () => {
    expect(editorialPaperDisplayFontFamily).toBe('Fraunces');
    expect(editorialPaperCjkTitleFontFamily).toBe('TW-Kai-98_1');
    expect(existsSync(path.resolve(process.cwd(), editorialPaperDisplayFontAssetPath))).toBe(true);
    expect(existsSync(path.resolve(process.cwd(), editorialPaperCjkTitleFontAssetPath))).toBe(true);
  });

  it('uses native sans fonts for body and meta typography', () => {
    expect(editorialPaperLightTokens.typography.body).not.toHaveProperty('fontFamily');
    expect(editorialPaperLightTokens.typography.meta).not.toHaveProperty('fontFamily');
  });

  it('builds a stable theme context value', () => {
    expect(createEditorialPaperThemeContextValue(true)).toEqual({
      themeKey: 'light',
      tokens: editorialPaperLightTokens,
      fontsLoaded: true,
    });
  });
});
