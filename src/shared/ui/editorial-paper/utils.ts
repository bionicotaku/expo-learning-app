import type { EditorialPaperTokens } from '@/shared/theme/editorial-paper';

import type {
  EditorialPaperControlSize,
  EditorialPaperRadiusKey,
  EditorialPaperTone,
} from './types';

export function resolveEditorialPaperToneColor(
  tokens: EditorialPaperTokens,
  tone: EditorialPaperTone
) {
  switch (tone) {
    case 'background':
      return tokens.color.background;
    case 'accent':
      return tokens.color.accent;
    case 'gold':
      return tokens.color.gold;
    case 'cocoa':
      return tokens.color.cocoa;
    case 'softActionRose':
      return tokens.color.softAction.rose;
    case 'softActionPeach':
      return tokens.color.softAction.peach;
    case 'softActionButter':
      return tokens.color.softAction.butter;
    case 'softActionPistachio':
      return tokens.color.softAction.pistachio;
    case 'softActionLavender':
      return tokens.color.softAction.lavender;
    case 'softActionSky':
      return tokens.color.softAction.sky;
    case 'surface':
    default:
      return tokens.color.surface;
  }
}

export function resolveEditorialPaperRadius(
  tokens: EditorialPaperTokens,
  radius: EditorialPaperRadiusKey | number | undefined,
  fallback: EditorialPaperRadiusKey
) {
  if (typeof radius === 'number') {
    return radius;
  }

  return tokens.radius[radius ?? fallback];
}

export function resolveEditorialPaperControlHeight(
  size: EditorialPaperControlSize
) {
  switch (size) {
    case 'sm':
      return 36;
    case 'lg':
      return 52;
    case 'md':
    default:
      return 44;
  }
}

export function resolveEditorialPaperTextColor(
  tokens: EditorialPaperTokens,
  tone: 'ink' | 'inkSoft' | 'inkMute'
) {
  switch (tone) {
    case 'inkSoft':
      return tokens.color.inkSoft;
    case 'inkMute':
      return tokens.color.inkMute;
    case 'ink':
    default:
      return tokens.color.ink;
  }
}
