export type FullscreenVideoOverlayActionItem = {
  accessibilityLabel: string;
  fallbackGlyph: string;
  id: 'like' | 'favorite' | 'share' | 'subtitle';
  iosSymbol:
    | 'heart.fill'
    | 'star.fill'
    | 'square.and.arrow.up'
    | 'text.bubble.fill';
};

export const fullscreenVideoOverlayActionItems: readonly FullscreenVideoOverlayActionItem[] = [
  {
    id: 'like',
    accessibilityLabel: 'Like',
    iosSymbol: 'heart.fill',
    fallbackGlyph: '♥',
  },
  {
    id: 'favorite',
    accessibilityLabel: 'Favorite',
    iosSymbol: 'star.fill',
    fallbackGlyph: '★',
  },
  {
    id: 'share',
    accessibilityLabel: 'Share',
    iosSymbol: 'square.and.arrow.up',
    fallbackGlyph: '↗',
  },
  {
    id: 'subtitle',
    accessibilityLabel: 'Subtitles',
    iosSymbol: 'text.bubble.fill',
    fallbackGlyph: 'CC',
  },
] as const;

export function formatFullscreenVideoCounterLabel(
  activeIndex: number | null,
  totalItems: number
) {
  if (activeIndex === null || totalItems <= 0) {
    return null;
  }

  return `${activeIndex + 1} / ${totalItems}`;
}
