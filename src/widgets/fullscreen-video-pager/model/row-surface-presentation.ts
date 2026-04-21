import type { FullscreenActivePlayerSurfaceState } from './active-player-controller';

export type FullscreenRowSurfacePresentation = {
  errorMessage: string | null;
  retry: (() => void) | null;
  surfaceState: FullscreenActivePlayerSurfaceState;
};
