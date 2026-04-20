export type FullscreenActivePlayerSurfaceState = 'loading' | 'ready' | 'error';

export type FullscreenActivePlayerController = {
  seekBy: (seconds: number) => boolean;
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
