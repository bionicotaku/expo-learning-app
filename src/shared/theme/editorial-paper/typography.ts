import type { EditorialPaperTokens } from './types';
import { editorialPaperDisplayFontFamily } from './fonts';

export const editorialPaperTypography: EditorialPaperTokens['typography'] = {
  display: {
    fontFamily: editorialPaperDisplayFontFamily,
    fontSize: 42,
    lineHeight: 44,
    fontWeight: '500',
    letterSpacing: -1.2,
  },
  title: {
    fontFamily: editorialPaperDisplayFontFamily,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '500',
    letterSpacing: -1.0,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  meta: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
};
