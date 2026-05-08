import { describe, expect, it } from 'vitest';

import type { TranscriptToken } from '@/entities/transcript';

import { createWordDetailDialogPayloadFromTranscriptToken } from './word-detail-dialog-payload';

function createToken(coarseId: number | null): TranscriptToken {
  return {
    end: 1200,
    explanation: '上下文里的 make 表示制作。',
    index: 0,
    semanticElement: {
      baseForm: 'make',
      coarseId,
      dictionary: '制作；做；使成为。',
      reason: 'reason is intentionally not shown in the word dialog',
    },
    start: 1000,
    text: 'Making',
  };
}

describe('word detail dialog payload', () => {
  it('maps a transcript token into the word detail payload including coarse_id', () => {
    expect(createWordDetailDialogPayloadFromTranscriptToken(createToken(108404))).toEqual({
      text: 'Making',
      explanation: '上下文里的 make 表示制作。',
      semantic_element: {
        base_form: 'make',
        coarse_id: 108404,
        dictionary: '制作；做；使成为。',
      },
    });
  });

  it('returns null when the token has no coarse id', () => {
    expect(createWordDetailDialogPayloadFromTranscriptToken(createToken(null))).toBeNull();
  });
});
