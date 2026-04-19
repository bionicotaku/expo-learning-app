export type FullscreenVideoItemRenderProps = {
  height: number;
  isActive: boolean;
  isMuted: boolean;
  shouldUsePlayer: boolean;
  videoId: string;
  width: number;
};

export function areFullscreenVideoItemRenderPropsEqual(
  previousProps: FullscreenVideoItemRenderProps,
  nextProps: FullscreenVideoItemRenderProps
): boolean {
  return (
    previousProps.videoId === nextProps.videoId &&
    previousProps.width === nextProps.width &&
    previousProps.height === nextProps.height &&
    previousProps.isActive === nextProps.isActive &&
    previousProps.isMuted === nextProps.isMuted &&
    previousProps.shouldUsePlayer === nextProps.shouldUsePlayer
  );
}

export type PlayableVideoSurfaceRenderProps = {
  isActive: boolean;
  isMuted: boolean;
  videoId: string;
};

export function arePlayableVideoSurfacePropsEqual(
  previousProps: PlayableVideoSurfaceRenderProps,
  nextProps: PlayableVideoSurfaceRenderProps
): boolean {
  return (
    previousProps.videoId === nextProps.videoId &&
    previousProps.isActive === nextProps.isActive &&
    previousProps.isMuted === nextProps.isMuted
  );
}
