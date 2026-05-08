import type { Transcript } from './types';

export const SENTENCE_START_LEAD_MS = 100;
export const SENTENCE_END_TRAIL_MS = 300;
export const MIN_TRANSCRIPT_TIME_MS = 1;
export const TRANSCRIPT_BOUNDARY_GAP_MS = 1;

function resolveOptimizedStarts(transcript: Transcript): number[] {
  return transcript.sentences.reduce<number[]>((starts, sentence, index) => {
    const leadStart = Math.max(
      MIN_TRANSCRIPT_TIME_MS,
      sentence.start - SENTENCE_START_LEAD_MS
    );
    const previousStart = starts[index - 1];

    starts.push(
      previousStart === undefined
        ? leadStart
        : Math.max(leadStart, previousStart + TRANSCRIPT_BOUNDARY_GAP_MS)
    );

    return starts;
  }, []);
}

export function prepareTranscriptForPlayback(transcript: Transcript): Transcript {
  const optimizedStarts = resolveOptimizedStarts(transcript);

  return {
    sentences: transcript.sentences.map((sentence, index) => {
      const start = optimizedStarts[index] ?? sentence.start;
      const nextStart = optimizedStarts[index + 1];
      const desiredEnd = sentence.end + SENTENCE_END_TRAIL_MS;
      const cappedEnd =
        nextStart === undefined
          ? desiredEnd
          : Math.min(desiredEnd, nextStart - TRANSCRIPT_BOUNDARY_GAP_MS);

      return {
        ...sentence,
        start,
        end: Math.max(cappedEnd, start + TRANSCRIPT_BOUNDARY_GAP_MS),
      };
    }),
  };
}
