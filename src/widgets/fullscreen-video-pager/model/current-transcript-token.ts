import type { TranscriptToken } from '@/entities/transcript';

type ResolveCurrentTranscriptTokenArgs = {
  currentTimeMs: number;
  previousIndex: number | null;
  tokens: readonly TranscriptToken[];
};

type ResolvedCurrentTranscriptToken = {
  index: number;
  token: TranscriptToken;
};

function containsTime(token: TranscriptToken | undefined, currentTimeMs: number) {
  return !!token && token.start <= currentTimeMs && currentTimeMs < token.end;
}

function resolveByIndex(
  tokens: readonly TranscriptToken[],
  currentTimeMs: number,
  index: number
): ResolvedCurrentTranscriptToken | null {
  const token = tokens[index];
  if (!containsTime(token, currentTimeMs)) {
    return null;
  }

  return {
    index,
    token,
  };
}

function resolveByBinarySearch(
  tokens: readonly TranscriptToken[],
  currentTimeMs: number
): ResolvedCurrentTranscriptToken | null {
  let left = 0;
  let right = tokens.length - 1;

  while (left <= right) {
    const middle = Math.floor((left + right) / 2);
    const token = tokens[middle]!;

    if (currentTimeMs < token.start) {
      right = middle - 1;
      continue;
    }

    if (currentTimeMs >= token.end) {
      left = middle + 1;
      continue;
    }

    return {
      index: middle,
      token,
    };
  }

  return null;
}

export function resolveCurrentTranscriptToken({
  currentTimeMs,
  previousIndex,
  tokens,
}: ResolveCurrentTranscriptTokenArgs): ResolvedCurrentTranscriptToken | null {
  if (tokens.length === 0 || !Number.isFinite(currentTimeMs)) {
    return null;
  }

  if (
    previousIndex !== null &&
    Number.isSafeInteger(previousIndex) &&
    previousIndex >= 0 &&
    previousIndex < tokens.length
  ) {
    const sameToken = resolveByIndex(tokens, currentTimeMs, previousIndex);
    if (sameToken) {
      return sameToken;
    }

    const previousToken = resolveByIndex(tokens, currentTimeMs, previousIndex - 1);
    if (previousToken) {
      return previousToken;
    }

    const nextToken = resolveByIndex(tokens, currentTimeMs, previousIndex + 1);
    if (nextToken) {
      return nextToken;
    }
  }

  return resolveByBinarySearch(tokens, currentTimeMs);
}
