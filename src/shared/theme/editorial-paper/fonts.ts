export const editorialPaperDisplayFontFamily = 'Fraunces';
export const editorialPaperDisplayFontAssetPath = 'assets/fonts/editorial-paper/fraunces-variable.ttf';

export function getEditorialPaperFontSources() {
  return {
    [editorialPaperDisplayFontFamily]: require('../../../../assets/fonts/editorial-paper/fraunces-variable.ttf'),
  } as const;
}
