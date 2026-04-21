export type FullscreenRowProgressSnapshot = {
  bufferedPositionSeconds: number;
  bufferedRatio: number;
  currentTimeSeconds: number;
  durationSeconds: number;
  playedRatio: number;
};

function clampRatio(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(1, value));
}

function normalizeSeconds(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, value);
}

export function createFullscreenRowProgressSnapshot({
  bufferedPositionSeconds,
  currentTimeSeconds,
  durationSeconds,
}: {
  bufferedPositionSeconds: number;
  currentTimeSeconds: number;
  durationSeconds: number;
}): FullscreenRowProgressSnapshot | null {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    return null;
  }

  const normalizedCurrentTimeSeconds = normalizeSeconds(currentTimeSeconds);
  const normalizedBufferedPositionSeconds = normalizeSeconds(bufferedPositionSeconds);

  return {
    bufferedPositionSeconds: normalizedBufferedPositionSeconds,
    bufferedRatio: clampRatio(normalizedBufferedPositionSeconds / durationSeconds),
    currentTimeSeconds: normalizedCurrentTimeSeconds,
    durationSeconds,
    playedRatio: clampRatio(normalizedCurrentTimeSeconds / durationSeconds),
  };
}
