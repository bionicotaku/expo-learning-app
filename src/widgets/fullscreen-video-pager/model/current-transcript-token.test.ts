import { describe, expect, it } from 'vitest';

import type { TranscriptToken } from '@/entities/transcript';

import { resolveCurrentTranscriptToken } from './current-transcript-token';

function createToken(index: number, start: number, end: number): TranscriptToken {
  return {
    end,
    explanation: `explanation ${index}`,
    index,
    semanticElement: {
      baseForm: `token-${index}`,
      coarseId: index,
      dictionary: `dictionary ${index}`,
      reason: `reason ${index}`,
    },
    start,
    text: `Token ${index}`,
  };
}

const tokens: TranscriptToken[] = [
  createToken(0, 0, 500),
  createToken(1, 600, 1000),
  createToken(2, 1000, 1400),
  createToken(3, 1800, 2300),
  createToken(4, 2300, 2800),
];

describe('current transcript token resolver', () => {
  it('keeps the previous index when the current time is still inside that token', () => {
    expect(
      resolveCurrentTranscriptToken({
        currentTimeMs: 800,
        previousIndex: 1,
        tokens,
      })
    ).toEqual({
      index: 1,
      token: tokens[1],
    });
  });

  it('checks the next token adjacent to the previous index before falling back', () => {
    expect(
      resolveCurrentTranscriptToken({
        currentTimeMs: 1200,
        previousIndex: 1,
        tokens,
      })
    ).toEqual({
      index: 2,
      token: tokens[2],
    });
  });

  it('checks the previous token adjacent to the previous index before falling back', () => {
    expect(
      resolveCurrentTranscriptToken({
        currentTimeMs: 700,
        previousIndex: 2,
        tokens,
      })
    ).toEqual({
      index: 1,
      token: tokens[1],
    });
  });

  it('falls back to binary search after a large seek', () => {
    expect(
      resolveCurrentTranscriptToken({
        currentTimeMs: 2500,
        previousIndex: 1,
        tokens,
      })
    ).toEqual({
      index: 4,
      token: tokens[4],
    });
  });

  it('returns null when the current time is in a gap between tokens', () => {
    expect(
      resolveCurrentTranscriptToken({
        currentTimeMs: 1600,
        previousIndex: 2,
        tokens,
      })
    ).toBeNull();
  });

  it('uses a half-open interval at token boundaries', () => {
    expect(
      resolveCurrentTranscriptToken({
        currentTimeMs: 1000,
        previousIndex: 1,
        tokens,
      })
    ).toEqual({
      index: 2,
      token: tokens[2],
    });
  });

  it('uses binary search immediately when there is no previous index', () => {
    expect(
      resolveCurrentTranscriptToken({
        currentTimeMs: 2000,
        previousIndex: null,
        tokens,
      })
    ).toEqual({
      index: 3,
      token: tokens[3],
    });
  });

  it('returns null for empty input and invalid time values', () => {
    expect(
      resolveCurrentTranscriptToken({
        currentTimeMs: 1000,
        previousIndex: null,
        tokens: [],
      })
    ).toBeNull();
    expect(
      resolveCurrentTranscriptToken({
        currentTimeMs: Number.NaN,
        previousIndex: 1,
        tokens,
      })
    ).toBeNull();
  });
});
