import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('video overlay action rail source', () => {
  it('passes like, favorite, and three-state subtitle presentation props down to action buttons', () => {
    const source = readFileSync(
      new URL('./video-overlay-action-rail.tsx', import.meta.url).pathname,
      'utf8'
    );

    expect(source).toContain('isLiked');
    expect(source).toContain('isFavorited');
    expect(source).toContain('likeCount');
    expect(source).toContain('favoriteCount');
    expect(source).toContain('formatEngagementCount');
    expect(source).toContain('areEngagementActionsDisabled');
    expect(source).toContain('subtitleDisplayMode');
    expect(source).toContain('getSubtitleActionPresentation');
    expect(source).toContain("'text.bubble'");
    expect(source).toContain("'text.bubble.fill'");
    expect(source).toContain("subtitleDisplayMode === 'bilingual'");
    expect(source).toContain("item.id === 'like'");
    expect(source).toContain("item.id === 'favorite'");
    expect(source).toContain("item.id === 'subtitle'");
    expect(source).toContain('countLabel={');
    expect(source).toContain('subtitleTint');
    expect(source).toContain('isActive={');
    expect(source).toContain('activeTintColor={');
    expect(source).toContain('iosSymbol={');
    expect(source).toContain('onPress={onActionPress}');
    expect(source).toContain("disabled={areEngagementActionsDisabled && (item.id === 'like' || item.id === 'favorite')}");
    expect(source).not.toContain("item.id === 'share'");
    expect(source).not.toContain("'square.and.arrow.up'");
    expect(source).not.toContain('() => {');
    expect(source).not.toContain('onActionPress(item);');
  });
});
