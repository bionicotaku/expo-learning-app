import type { TranscriptSentence } from '@/entities/transcript';

export type TranscriptSentenceSeekDirection = 'backward' | 'forward';

type ResolveTranscriptSentenceSeekTargetArgs = {
  currentTimeMs: number;
  direction: TranscriptSentenceSeekDirection;
  durationMs: number;
  rewindThresholdMs?: number;
  sentences: readonly TranscriptSentence[];
};

type TranscriptSentenceTimelinePosition = {
  currentIndex: number | null;
  nextIndex: number | null;
  previousIndex: number | null;
};

export type TranscriptSentenceSeekTarget = {
  direction: TranscriptSentenceSeekDirection;
  targetTimeMs: number;
};

const defaultRewindThresholdMs = 1_500;

function isValidTime(value: number) {
  return Number.isFinite(value) && value >= 0;
}

function resolveTimelinePosition(
  sentences: readonly TranscriptSentence[],
  currentTimeMs: number
): TranscriptSentenceTimelinePosition {
  let left = 0;
  let right = sentences.length - 1;
  let previousIndex: number | null = null;
  let nextIndex: number | null = null;

  while (left <= right) {
    const middle = Math.floor((left + right) / 2);
    const sentence = sentences[middle]!;

    if (currentTimeMs < sentence.start) {
      nextIndex = middle;
      right = middle - 1;
      continue;
    }

    if (currentTimeMs >= sentence.end) {
      previousIndex = middle;
      left = middle + 1;
      continue;
    }

    return {
      currentIndex: middle,
      nextIndex: middle + 1 < sentences.length ? middle + 1 : null,
      previousIndex: middle > 0 ? middle - 1 : null,
    };
  }

  return {
    currentIndex: null,
    nextIndex,
    previousIndex,
  };
}

function resolveForwardTarget(
  sentences: readonly TranscriptSentence[],
  position: TranscriptSentenceTimelinePosition,
  durationMs: number
): number {
  const nextIndex =
    position.currentIndex === null
      ? position.nextIndex
      : position.currentIndex + 1 < sentences.length
        ? position.currentIndex + 1
        : null;

  if (nextIndex === null) {
    return durationMs;
  }

  return sentences[nextIndex]!.start;
}

function resolveBackwardTargetFromBaseline({
  baselineIndex,
  currentTimeMs,
  rewindThresholdMs,
  sentences,
}: {
  baselineIndex: number | null;
  currentTimeMs: number;
  rewindThresholdMs: number;
  sentences: readonly TranscriptSentence[];
}): number {
  if (baselineIndex === null) {
    return 0;
  }

  const baselineSentence = sentences[baselineIndex]!;
  if (currentTimeMs - baselineSentence.start > rewindThresholdMs) {
    return baselineSentence.start;
  }

  if (baselineIndex <= 0) {
    return 0;
  }

  return sentences[baselineIndex - 1]!.start;
}

function resolveBackwardTarget(
  sentences: readonly TranscriptSentence[],
  position: TranscriptSentenceTimelinePosition,
  currentTimeMs: number,
  rewindThresholdMs: number
): number {
  return resolveBackwardTargetFromBaseline({
    baselineIndex: position.currentIndex ?? position.previousIndex,
    currentTimeMs,
    rewindThresholdMs,
    sentences,
  });
}

export function resolveTranscriptSentenceSeekTarget({
  currentTimeMs,
  direction,
  durationMs,
  rewindThresholdMs = defaultRewindThresholdMs,
  sentences,
}: ResolveTranscriptSentenceSeekTargetArgs): TranscriptSentenceSeekTarget | null {
  if (
    sentences.length === 0 ||
    !isValidTime(currentTimeMs) ||
    !isValidTime(durationMs) ||
    durationMs <= 0 ||
    !Number.isFinite(rewindThresholdMs) ||
    rewindThresholdMs < 0
  ) {
    return null;
  }

  const position = resolveTimelinePosition(sentences, currentTimeMs);
  const targetTimeMs =
    direction === 'forward'
      ? resolveForwardTarget(sentences, position, durationMs)
      : resolveBackwardTarget(sentences, position, currentTimeMs, rewindThresholdMs);

  return {
    direction,
    targetTimeMs: Math.max(0, Math.min(durationMs, targetTimeMs)),
  };
}
