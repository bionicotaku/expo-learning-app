import type { EditorialPaperTokens } from './types';
import { editorialPaperElevation } from './elevation';
import { editorialPaperGlass } from './glass';
import { editorialPaperRadius } from './radius';
import { editorialPaperSpacing } from './spacing';
import { editorialPaperTypography } from './typography';

export const editorialPaperLightTokens: EditorialPaperTokens = {
  color: {
    background: '#F4EFE6',
    surface: '#FBF7EE',
    ink: '#1C1A17',
    inkSoft: '#4A453E',
    inkMute: '#8B8377',
    accent: '#C85A2C',
    gold: '#B89454',
    cocoa: '#8E6B45',
    softAction: {
      rose: '#E8B8C0',
      peach: '#F2C7A7',
      butter: '#F2DF9C',
      pistachio: '#CFE0B8',
      lavender: '#D8CBEA',
      sky: '#CFE0EA',
    },
  },
  typography: editorialPaperTypography,
  spacing: editorialPaperSpacing,
  radius: editorialPaperRadius,
  elevation: editorialPaperElevation,
  glass: editorialPaperGlass,
};
