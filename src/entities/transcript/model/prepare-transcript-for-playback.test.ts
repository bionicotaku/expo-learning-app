import { describe, expect, it } from 'vitest';

import type { Transcript, TranscriptSentence, TranscriptToken } from './types';
import {
  prepareTranscriptForPlayback,
  SENTENCE_END_TRAIL_MS,
  SENTENCE_START_LEAD_MS,
  TRANSCRIPT_BOUNDARY_GAP_MS,
} from './prepare-transcript-for-playback';

function createToken(index: number, start: number, end: number): TranscriptToken {
  return {
    end,
    explanation: `Token explanation ${index}`,
    index,
    semanticElement: {
      baseForm: `token-${index}`,
      coarseId: index,
      dictionary: `Dictionary ${index}`,
      reason: `Reason ${index}`,
    },
    start,
    text: `Token ${index}`,
  };
}

function createSentence(index: number, start: number, end: number): TranscriptSentence {
  return {
    end,
    explanation: `Sentence explanation ${index}`,
    index,
    start,
    text: `Sentence ${index}`,
    tokens: [createToken(index, start, end)],
  };
}

describe('prepareTranscriptForPlayback', () => {
  it('leads sentence starts, trails sentence ends, and caps overlaps by the next optimized start', () => {
    const transcript: Transcript = {
      sentences: [
        createSentence(0, 50, 500),
        createSentence(1, 580, 900),
        createSentence(2, 1500, 1800),
      ],
    };

    const prepared = prepareTranscriptForPlayback(transcript);

    expect(prepared.sentences.map(({ start, end }) => ({ start, end }))).toEqual([
      {
        start: 1,
        end: 580 - SENTENCE_START_LEAD_MS - TRANSCRIPT_BOUNDARY_GAP_MS,
      },
      {
        start: 580 - SENTENCE_START_LEAD_MS,
        end: 900 + SENTENCE_END_TRAIL_MS,
      },
      {
        start: 1500 - SENTENCE_START_LEAD_MS,
        end: 1800 + SENTENCE_END_TRAIL_MS,
      },
    ]);
  });

  it('keeps optimized starts strictly increasing when adjacent sentences are very close', () => {
    const transcript: Transcript = {
      sentences: [
        createSentence(0, 20, 60),
        createSentence(1, 25, 80),
        createSentence(2, 25, 90),
      ],
    };

    const prepared = prepareTranscriptForPlayback(transcript);

    expect(prepared.sentences.map((sentence) => sentence.start)).toEqual([1, 2, 3]);
  });

  it('does not mutate input or change token timing', () => {
    const transcript: Transcript = {
      sentences: [
        createSentence(0, 200, 500),
        createSentence(1, 900, 1200),
      ],
    };
    const originalTokenSnapshot = transcript.sentences.map((sentence) =>
      sentence.tokens.map((token) => ({
        start: token.start,
        end: token.end,
      }))
    );

    const prepared = prepareTranscriptForPlayback(transcript);

    expect(prepared).not.toBe(transcript);
    expect(prepared.sentences[0]).not.toBe(transcript.sentences[0]);
    expect(transcript.sentences.map(({ start, end }) => ({ start, end }))).toEqual([
      { start: 200, end: 500 },
      { start: 900, end: 1200 },
    ]);
    expect(prepared.sentences.map((sentence) =>
      sentence.tokens.map((token) => ({
        start: token.start,
        end: token.end,
      }))
    )).toEqual(originalTokenSnapshot);
  });
});
