export type FullscreenVideoOverlayActionItem = {
  accessibilityLabel: string;
  fallbackGlyph: string;
  id: 'like' | 'favorite' | 'subtitle';
  iosSymbol:
    | 'heart.fill'
    | 'star.fill'
    | 'text.bubble'
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
