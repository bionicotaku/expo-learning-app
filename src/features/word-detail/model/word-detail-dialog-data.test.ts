import { describe, expect, it } from 'vitest';

import type { TranscriptToken } from '@/entities/transcript';

import { createWordDetailDialogDataFromTranscriptToken } from './word-detail-dialog-data';

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

describe('word detail dialog data', () => {
  it('maps a transcript token into title, subtitle, and ordered sections', () => {
    expect(createWordDetailDialogDataFromTranscriptToken(createToken(108404))).toEqual({
      title: 'Making',
      subtitle: 'make',
      showLearningFeedbackActions: true,
      sections: [
        {
          id: 'context',
          title: '上下文释义',
          body: '上下文里的 make 表示制作。',
        },
        {
          id: 'dictionary',
          title: '字典释义',
          body: '制作；做；使成为。',
        },
      ],
    });
  });

  it('does not show learning feedback actions when the token has no coarse id', () => {
    expect(createWordDetailDialogDataFromTranscriptToken(createToken(null))).toEqual({
      title: 'Making',
      subtitle: 'make',
      showLearningFeedbackActions: false,
      sections: [
        {
          id: 'context',
          title: '上下文释义',
          body: '上下文里的 make 表示制作。',
        },
        {
          id: 'dictionary',
          title: '字典释义',
          body: '制作；做；使成为。',
        },
      ],
    });
  });
});
