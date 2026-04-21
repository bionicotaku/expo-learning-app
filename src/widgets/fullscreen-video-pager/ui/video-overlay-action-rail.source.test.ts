import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('video overlay action rail source', () => {
  it('passes like and favorite active-state props down to action buttons', () => {
    const source = readFileSync(
      new URL('./video-overlay-action-rail.tsx', import.meta.url).pathname,
      'utf8'
    );

    expect(source).toContain('isLiked');
    expect(source).toContain('isFavorited');
    expect(source).toContain("item.id === 'like'");
    expect(source).toContain("item.id === 'favorite'");
    expect(source).toContain('isActive={');
    expect(source).toContain('activeTintColor={');
    expect(source).toContain('onPress={onActionPress}');
    expect(source).not.toContain('() => {');
    expect(source).not.toContain('onActionPress(item);');
  });
});
