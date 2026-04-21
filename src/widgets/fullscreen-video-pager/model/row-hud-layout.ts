import type { FullscreenRowTransientFeedback } from './row-playback-hud-state';
import type { FullscreenActivePlayerSurfaceState } from './active-player-controller';

export type RowHudCenterOwner = 'pause' | 'loading' | null;

export type RowHudSlots = {
  centerOwner: RowHudCenterOwner;
  showLeftSeek: boolean;
  showRate: boolean;
  showRightSeek: boolean;
};

export const rowHudFadeOutDurationMs = 140;

export function shouldReserveCenterForPause({
  pauseVisible,
  transientFeedbackKind,
}: {
  pauseVisible: boolean;
  transientFeedbackKind: FullscreenRowTransientFeedback['kind'] | null;
}): boolean {
  return pauseVisible && transientFeedbackKind !== 'rate';
}

export function resolveRowHudCenterOwner({
  pauseVisible,
  pauseExitReserved,
  surfaceState,
}: {
  pauseExitReserved: boolean;
  pauseVisible: boolean;
  surfaceState: FullscreenActivePlayerSurfaceState | null;
}): RowHudCenterOwner {
  if (pauseVisible || pauseExitReserved) {
    return 'pause';
  }

  if (surfaceState === 'loading') {
    return 'loading';
  }

  return null;
}
