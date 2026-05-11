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
    expect(source).toContain('displayMode');
    expect(source).toContain('useMemo');
    expect(source).toContain('tokenDisplayParts');
    expect(source).toContain('transcript: Transcript;');
    expect(source).toContain('fullscreenVideoOverlayTheme.subtitleText.fontSize');
    expect(source).toContain('fullscreenVideoOverlayTheme.subtitleText.lineHeight');
    expect(source).toContain('fullscreenVideoOverlayTheme.subtitleExplanationText.fontSize');
    expect(source).toContain('fullscreenVideoOverlayTheme.subtitleExplanationText.lineHeight');
    expect(source).not.toContain("displayMode === 'off'");
    expect(source).toContain("displayMode === 'bilingual'");
    expect(source).toContain('currentSentenceValue.explanation');
    expect(source).toContain('pointerEvents="box-none"');
    expect(source).toContain('onTokenPress');
    expect(source).toContain('sentence: currentSentenceValue');
    expect(source).toContain('token');
    expect(source).toContain('event.stopPropagation?.()');
    expect(source).not.toContain('token.semanticElement.coarseId !== null');
    expect(source).not.toContain("fontWeight: isActive");
    expect(source).not.toContain('numberOfLines');
    expect(source).not.toContain('subtitleLineCount');
    expect(source).not.toContain('height: subtitleHeight');
    expect(source).not.toContain('SENTENCE_START_LEAD_MS');
    expect(source).not.toContain('SENTENCE_END_TRAIL_MS');
    expect(source).not.toContain('prepareTranscriptForPlayback');
    expect(source).toContain("fontWeight: '500'");
    expect(source).not.toContain('paddingBottom: 6');
    expect(source).not.toContain('shouldReserveSpace');
    expect(source).not.toContain('Pressable');
    expect(source).not.toContain('GestureDetector');
    expect(source).not.toContain('Modal');
    expect(source).not.toContain('usePresent');
    expect(source).not.toContain('usePresentWordDetailDialog');
    expect(source).not.toContain('seekTo');
    expect(source).not.toContain('resolveTranscriptSentenceSeekTarget');
  });
});
