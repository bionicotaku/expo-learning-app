import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('basic subtitle overlay source', () => {
  it('subscribes to row-local playback time without owning gestures or modal behavior', () => {
    const source = readFileSync(
      new URL('./basic-subtitle-overlay.tsx', import.meta.url).pathname,
      'utf8'
    );

    expect(source).toContain('useSyncExternalStore');
    expect(source).toContain('resolveCurrentTranscriptSentence');
    expect(source).toContain('resolveCurrentTranscriptToken');
    expect(source).toContain('activeSubtitleTokenStyle');
    expect(source).toContain('pointerEvents="box-none"');
    expect(source).toContain('onTokenPress');
    expect(source).toContain('event.stopPropagation?.()');
    expect(source).not.toContain('token.semanticElement.coarseId !== null');
    expect(source).not.toContain("fontWeight: isActive");
    expect(source).not.toContain('numberOfLines');
    expect(source).not.toContain('subtitleLineCount');
    expect(source).not.toContain('height: subtitleHeight');
    expect(source).toContain("fontWeight: '500'");
    expect(source).not.toContain('paddingBottom: 6');
    expect(source).not.toContain('shouldReserveSpace');
    expect(source).not.toContain('Pressable');
    expect(source).not.toContain('GestureDetector');
    expect(source).not.toContain('Modal');
    expect(source).not.toContain('usePresent');
    expect(source).not.toContain('usePresentWordDetailDialog');
  });
});
