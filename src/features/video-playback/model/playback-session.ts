type ResolvePausedByUserAfterActiveChangeArgs = {
  currentActiveIndex: number | null;
  nextActiveIndex: number;
  pausedByUser: boolean;
};

type ShouldPlayVideoArgs = {
  activeIndex: number | null;
  itemIndex: number;
  pausedByUser: boolean;
};

export function togglePlaybackPausedByUser(pausedByUser: boolean): boolean {
  return !pausedByUser;
}

export function resolvePausedByUserAfterActiveChange({
  currentActiveIndex,
  nextActiveIndex,
  pausedByUser,
}: ResolvePausedByUserAfterActiveChangeArgs): boolean {
  if (currentActiveIndex === nextActiveIndex) {
    return pausedByUser;
  }

  return false;
}

export function shouldPlayVideo({
  activeIndex,
  itemIndex,
  pausedByUser,
}: ShouldPlayVideoArgs): boolean {
  return activeIndex === itemIndex && !pausedByUser;
}
