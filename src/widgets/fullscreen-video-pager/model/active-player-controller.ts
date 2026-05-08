export type FullscreenActivePlayerSurfaceState = 'loading' | 'ready' | 'error';

export type FullscreenActivePlayerController = {
  getCurrentTimeSeconds: () => number | null;
  getDurationSeconds: () => number | null;
  seekBy: (seconds: number) => boolean;
  seekTo: (seconds: number) => boolean;
  surfaceState: FullscreenActivePlayerSurfaceState;
};

export function resolveActivePlayerSurfaceState(
  status: string
): FullscreenActivePlayerSurfaceState {
  if (status === 'readyToPlay') {
    return 'ready';
  }

  if (status === 'error') {
    return 'error';
  }

  return 'loading';
}
