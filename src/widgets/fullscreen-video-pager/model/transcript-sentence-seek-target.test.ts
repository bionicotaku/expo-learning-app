import { describe, expect, it } from 'vitest';

import type { TranscriptSentence } from '@/entities/transcript';

import { resolveTranscriptSentenceSeekTarget } from './transcript-sentence-seek-target';

function createSentence(
  index: number,
  start: number,
  end: number
): TranscriptSentence {
  return {
    end,
    explanation: `sentence ${index}`,
    index,
    start,
    text: `Sentence ${index}`,
    tokens: [],
  };
}

const sentences = [
  createSentence(0, 1_000, 2_000),
  createSentence(1, 3_000, 4_500),
  createSentence(2, 6_000, 7_000),
] as const;

describe('transcript sentence seek target', () => {
  it('jumps forward from a sentence to the next sentence start', () => {
    expect(
      resolveTranscriptSentenceSeekTarget({
        currentTimeMs: 3_500,
        direction: 'forward',
        durationMs: 10_000,
        sentences,
      })
    ).toEqual({
      direction: 'forward',
      targetTimeMs: 6_000,
    });
  });

  it('jumps forward from a gap to the next sentence start', () => {
    expect(
      resolveTranscriptSentenceSeekTarget({
        currentTimeMs: 4_500,
        direction: 'forward',
        durationMs: 10_000,
        sentences,
      })
    ).toEqual({
      direction: 'forward',
      targetTimeMs: 6_000,
    });
  });

  it('jumps forward before the first sentence to the first sentence start', () => {
    expect(
      resolveTranscriptSentenceSeekTarget({
        currentTimeMs: 400,
        direction: 'forward',
        durationMs: 10_000,
        sentences,
      })
    ).toEqual({
      direction: 'forward',
      targetTimeMs: 1_000,
    });
  });

  it('jumps forward from the final sentence or after it to the video end', () => {
    expect(
      resolveTranscriptSentenceSeekTarget({
        currentTimeMs: 6_500,
        direction: 'forward',
        durationMs: 10_000,
        sentences,
      })
    ).toEqual({
      direction: 'forward',
      targetTimeMs: 10_000,
    });

    expect(
      resolveTranscriptSentenceSeekTarget({
        currentTimeMs: 8_000,
        direction: 'forward',
        durationMs: 10_000,
        sentences,
      })
    ).toEqual({
      direction: 'forward',
      targetTimeMs: 10_000,
    });
  });

  it('jumps backward to the current sentence start after more than the threshold', () => {
    expect(
      resolveTranscriptSentenceSeekTarget({
        currentTimeMs: 4_001,
        direction: 'backward',
        durationMs: 10_000,
        rewindThresholdMs: 1_000,
        sentences,
      })
    ).toEqual({
      direction: 'backward',
      targetTimeMs: 3_000,
    });
  });

  it('jumps backward to the previous sentence start at or below the threshold', () => {
    expect(
      resolveTranscriptSentenceSeekTarget({
        currentTimeMs: 4_000,
        direction: 'backward',
        durationMs: 10_000,
        rewindThresholdMs: 1_000,
        sentences,
      })
    ).toEqual({
      direction: 'backward',
      targetTimeMs: 1_000,
    });
  });

  it('jumps backward to video start when there is no previous sentence', () => {
    expect(
      resolveTranscriptSentenceSeekTarget({
        currentTimeMs: 1_500,
        direction: 'backward',
        durationMs: 10_000,
        rewindThresholdMs: 1_000,
        sentences,
      })
    ).toEqual({
      direction: 'backward',
      targetTimeMs: 0,
    });

    expect(
      resolveTranscriptSentenceSeekTarget({
        currentTimeMs: 400,
        direction: 'backward',
        durationMs: 10_000,
        sentences,
      })
    ).toEqual({
      direction: 'backward',
      targetTimeMs: 0,
    });
  });

  it('uses the previous sentence as the backward threshold baseline in gaps', () => {
    expect(
      resolveTranscriptSentenceSeekTarget({
        currentTimeMs: 2_200,
        direction: 'backward',
        durationMs: 10_000,
        rewindThresholdMs: 1_000,
        sentences,
      })
    ).toEqual({
      direction: 'backward',
      targetTimeMs: 1_000,
    });

    expect(
      resolveTranscriptSentenceSeekTarget({
        currentTimeMs: 2_000,
        direction: 'backward',
        durationMs: 10_000,
        rewindThresholdMs: 1_000,
        sentences,
      })
    ).toEqual({
      direction: 'backward',
      targetTimeMs: 0,
    });
  });

  it('treats an end boundary as not matching the previous sentence', () => {
    expect(
      resolveTranscriptSentenceSeekTarget({
        currentTimeMs: 2_000,
        direction: 'forward',
        durationMs: 10_000,
        sentences,
      })
    ).toEqual({
      direction: 'forward',
      targetTimeMs: 3_000,
    });
  });

  it('returns null for empty sentences or invalid time inputs', () => {
    expect(
      resolveTranscriptSentenceSeekTarget({
        currentTimeMs: 1_000,
        direction: 'forward',
        durationMs: 10_000,
        sentences: [],
      })
    ).toBeNull();

    expect(
      resolveTranscriptSentenceSeekTarget({
        currentTimeMs: Number.NaN,
        direction: 'forward',
        durationMs: 10_000,
        sentences,
      })
    ).toBeNull();

    expect(
      resolveTranscriptSentenceSeekTarget({
        currentTimeMs: 1_000,
        direction: 'forward',
        durationMs: 0,
        sentences,
      })
    ).toBeNull();
  });
});
