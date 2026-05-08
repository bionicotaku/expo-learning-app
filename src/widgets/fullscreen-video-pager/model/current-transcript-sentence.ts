import type { TranscriptSentence } from '@/entities/transcript';

type ResolveCurrentTranscriptSentenceArgs = {
  currentTimeMs: number;
  previousIndex: number | null;
  sentences: readonly TranscriptSentence[];
};

type ResolvedCurrentTranscriptSentence = {
  index: number;
  sentence: TranscriptSentence;
};

function containsTime(sentence: TranscriptSentence | undefined, currentTimeMs: number) {
  return !!sentence && sentence.start <= currentTimeMs && currentTimeMs < sentence.end;
}

function resolveByIndex(
  sentences: readonly TranscriptSentence[],
  currentTimeMs: number,
  index: number
): ResolvedCurrentTranscriptSentence | null {
  const sentence = sentences[index];
  if (!containsTime(sentence, currentTimeMs)) {
    return null;
  }

  return {
    index,
    sentence,
  };
}

function resolveByBinarySearch(
  sentences: readonly TranscriptSentence[],
  currentTimeMs: number
): ResolvedCurrentTranscriptSentence | null {
  let left = 0;
  let right = sentences.length - 1;

  while (left <= right) {
    const middle = Math.floor((left + right) / 2);
    const sentence = sentences[middle]!;

    if (currentTimeMs < sentence.start) {
      right = middle - 1;
      continue;
    }

    if (currentTimeMs >= sentence.end) {
      left = middle + 1;
      continue;
    }

    return {
      index: middle,
      sentence,
    };
  }

  return null;
}

export function resolveCurrentTranscriptSentence({
  currentTimeMs,
  previousIndex,
  sentences,
}: ResolveCurrentTranscriptSentenceArgs): ResolvedCurrentTranscriptSentence | null {
  if (sentences.length === 0 || !Number.isFinite(currentTimeMs)) {
    return null;
  }

  if (
    previousIndex !== null &&
    Number.isSafeInteger(previousIndex) &&
    previousIndex >= 0 &&
    previousIndex < sentences.length
  ) {
    const sameSentence = resolveByIndex(sentences, currentTimeMs, previousIndex);
    if (sameSentence) {
      return sameSentence;
    }

    const previousSentence = resolveByIndex(sentences, currentTimeMs, previousIndex - 1);
    if (previousSentence) {
      return previousSentence;
    }

    const nextSentence = resolveByIndex(sentences, currentTimeMs, previousIndex + 1);
    if (nextSentence) {
      return nextSentence;
    }
  }

  return resolveByBinarySearch(sentences, currentTimeMs);
}
