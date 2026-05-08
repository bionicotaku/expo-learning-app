import { describe, expect, it } from 'vitest';

import type { TranscriptToken } from '@/entities/transcript';

import { getTranscriptTokenTrailingText } from './transcript-token-display';

function createToken(text: string): TranscriptToken {
  return {
    end: 1000,
    explanation: `${text} explanation`,
    index: 0,
    semanticElement: {
      baseForm: text,
      coarseId: 1,
      dictionary: `${text} dictionary`,
      reason: `${text} reason`,
    },
    start: 0,
    text,
  };
}

describe('transcript token display', () => {
  it('adds a space before regular following tokens', () => {
    expect(getTranscriptTokenTrailingText(createToken('Making'), createToken('copies'))).toBe(' ');
  });

  it('does not add a space before leading punctuation or after the final token', () => {
    expect(getTranscriptTokenTrailingText(createToken('copies'), createToken('!'))).toBe('');
    expect(getTranscriptTokenTrailingText(createToken('!'), null)).toBe('');
  });
});
