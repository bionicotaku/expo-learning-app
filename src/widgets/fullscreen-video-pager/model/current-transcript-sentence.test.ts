import { describe, expect, it } from 'vitest';

import type { TranscriptSentence } from '@/entities/transcript';

import { resolveCurrentTranscriptSentence } from './current-transcript-sentence';

function createSentence(index: number, start: number, end: number): TranscriptSentence {
  return {
    end,
    explanation: `explanation ${index}`,
    index,
    start,
    text: `Sentence ${index}`,
    tokens: [],
  };
}

const sentences: TranscriptSentence[] = [
  createSentence(0, 0, 1000),
  createSentence(1, 1200, 2400),
  createSentence(2, 2400, 3600),
  createSentence(3, 5000, 6200),
  createSentence(4, 6200, 7200),
];

describe('current transcript sentence resolver', () => {
  it('keeps the previous index when the current time is still inside that sentence', () => {
    expect(
      resolveCurrentTranscriptSentence({
        currentTimeMs: 1500,
        previousIndex: 1,
        sentences,
      })
    ).toEqual({
      index: 1,
      sentence: sentences[1],
    });
  });

  it('checks the next sentence adjacent to the previous index before falling back', () => {
    expect(
      resolveCurrentTranscriptSentence({
        currentTimeMs: 2600,
        previousIndex: 1,
        sentences,
      })
    ).toEqual({
      index: 2,
      sentence: sentences[2],
    });
  });

  it('checks the previous sentence adjacent to the previous index before falling back', () => {
    expect(
      resolveCurrentTranscriptSentence({
        currentTimeMs: 1300,
        previousIndex: 2,
        sentences,
      })
    ).toEqual({
      index: 1,
      sentence: sentences[1],
    });
  });

  it('falls back to binary search after a large seek', () => {
    expect(
      resolveCurrentTranscriptSentence({
        currentTimeMs: 6600,
        previousIndex: 1,
        sentences,
      })
    ).toEqual({
      index: 4,
      sentence: sentences[4],
    });
  });

  it('returns null when the current time is in a gap between sentences', () => {
    expect(
      resolveCurrentTranscriptSentence({
        currentTimeMs: 1100,
        previousIndex: 0,
        sentences,
      })
    ).toBeNull();
  });

  it('uses a half-open interval at sentence boundaries', () => {
    expect(
      resolveCurrentTranscriptSentence({
        currentTimeMs: 2400,
        previousIndex: 1,
        sentences,
      })
    ).toEqual({
      index: 2,
      sentence: sentences[2],
    });
  });

  it('uses binary search immediately when there is no previous index', () => {
    expect(
      resolveCurrentTranscriptSentence({
        currentTimeMs: 5400,
        previousIndex: null,
        sentences,
      })
    ).toEqual({
      index: 3,
      sentence: sentences[3],
    });
  });

  it('returns null for empty input and invalid time values', () => {
    expect(
      resolveCurrentTranscriptSentence({
        currentTimeMs: 1000,
        previousIndex: null,
        sentences: [],
      })
    ).toBeNull();
    expect(
      resolveCurrentTranscriptSentence({
        currentTimeMs: Number.NaN,
        previousIndex: 1,
        sentences,
      })
    ).toBeNull();
  });
});
