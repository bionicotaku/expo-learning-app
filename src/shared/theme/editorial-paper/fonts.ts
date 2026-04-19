export const editorialPaperDisplayFontFamily = 'Fraunces';
export const editorialPaperDisplayFontAssetPath = 'assets/fonts/editorial-paper/fraunces-variable.ttf';
export const editorialPaperCjkTitleFontFamily = 'TW-Kai-98_1';
export const editorialPaperCjkTitleFontAssetPath = 'assets/fonts/editorial-paper/TW-Kai-98_1.ttf';

export function getEditorialPaperFontSources() {
  return {
    [editorialPaperDisplayFontFamily]: require('../../../../assets/fonts/editorial-paper/fraunces-variable.ttf'),
    [editorialPaperCjkTitleFontFamily]: require('../../../../assets/fonts/editorial-paper/TW-Kai-98_1.ttf'),
  } as const;
}
