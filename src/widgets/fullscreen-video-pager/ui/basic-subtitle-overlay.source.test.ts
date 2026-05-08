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
    expect(source).toContain('pointerEvents="none"');
    expect(source).toContain('numberOfLines={2}');
    expect(source).toContain('shouldReserveSpace');
    expect(source).not.toContain('Pressable');
    expect(source).not.toContain('GestureDetector');
    expect(source).not.toContain('Modal');
    expect(source).not.toContain('usePresent');
  });
});
