import type { FullscreenActivePlayerSurfaceState } from './active-player-controller';

type ShouldShowPausedPlaybackIndicatorArgs = {
  activeItemId: string | null;
  activeSurfaceState: FullscreenActivePlayerSurfaceState | null;
  shouldPlay: boolean;
};

export function shouldShowPausedPlaybackIndicator({
  activeItemId,
  activeSurfaceState,
  shouldPlay,
}: ShouldShowPausedPlaybackIndicatorArgs): boolean {
  return activeItemId !== null && activeSurfaceState !== 'error' && !shouldPlay;
}
