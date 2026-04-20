export type FullscreenTapZone = 'left' | 'right';

export type FullscreenHoldZone = 'left' | 'center' | 'right';

export type FullscreenTransientHoldState = {
  resumedFromPause: boolean;
  zone: FullscreenHoldZone;
};

type ResolveBasePausedByUserAfterActiveChangeArgs = {
  currentActiveIndex: number | null;
  nextActiveIndex: number;
  basePausedByUser: boolean;
};

type ResolveTransientHoldStateAfterActiveChangeArgs = {
  currentActiveIndex: number | null;
  nextActiveIndex: number;
  transientHoldState: FullscreenTransientHoldState | null;
};

type ResolveEffectivePlaybackStateArgs = {
  activeIndex: number | null;
  basePausedByUser: boolean;
  itemIndex: number;
  transientHoldState: FullscreenTransientHoldState | null;
};

export function resolveFullscreenTapZone(
  x: number,
  width: number
): FullscreenTapZone {
  if (width <= 0) {
    return 'right';
  }

  return x < width / 2 ? 'left' : 'right';
}

export function resolveFullscreenHoldZone(
  x: number,
  width: number
): FullscreenHoldZone {
  if (width <= 0) {
    return 'right';
  }

  const oneThird = width / 3;
  if (x < oneThird) {
    return 'left';
  }

  if (x < oneThird * 2) {
    return 'center';
  }

  return 'right';
}

export function toggleBasePlaybackPausedByUser(
  basePausedByUser: boolean
): boolean {
  return !basePausedByUser;
}

export function createTransientHoldState({
  basePausedByUser,
  zone,
}: {
  basePausedByUser: boolean;
  zone: FullscreenHoldZone;
}): FullscreenTransientHoldState {
  return {
    resumedFromPause: basePausedByUser,
    zone,
  };
}

export function isGestureLocked(
  transientHoldState: FullscreenTransientHoldState | null
): boolean {
  return transientHoldState !== null;
}

export function resolveBasePausedByUserAfterActiveChange({
  currentActiveIndex,
  nextActiveIndex,
  basePausedByUser,
}: ResolveBasePausedByUserAfterActiveChangeArgs): boolean {
  if (currentActiveIndex === nextActiveIndex) {
    return basePausedByUser;
  }

  return false;
}

export function resolveTransientHoldStateAfterActiveChange({
  currentActiveIndex,
  nextActiveIndex,
  transientHoldState,
}: ResolveTransientHoldStateAfterActiveChangeArgs): FullscreenTransientHoldState | null {
  if (currentActiveIndex === nextActiveIndex) {
    return transientHoldState;
  }

  return null;
}

export function resolveEffectivePlaybackState({
  activeIndex,
  basePausedByUser,
  itemIndex,
  transientHoldState,
}: ResolveEffectivePlaybackStateArgs): {
  isGestureLocked: boolean;
  playbackRate: number;
  shouldPlay: boolean;
} {
  const gestureLocked = isGestureLocked(transientHoldState);
  if (activeIndex !== itemIndex) {
    return {
      isGestureLocked: gestureLocked,
      playbackRate: 1,
      shouldPlay: false,
    };
  }

  if (transientHoldState?.zone === 'left' || transientHoldState?.zone === 'right') {
    return {
      isGestureLocked: true,
      playbackRate: 2,
      shouldPlay: true,
    };
  }

  return {
    isGestureLocked: gestureLocked,
    playbackRate: 1,
    shouldPlay: !basePausedByUser,
  };
}
