export type FullscreenVideoItemRenderProps = {
  height: number;
  isActive: boolean;
  shouldUsePlayer: boolean;
  shouldPlay: boolean;
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
    previousProps.shouldUsePlayer === nextProps.shouldUsePlayer &&
    previousProps.shouldPlay === nextProps.shouldPlay
  );
}

export type PlayableVideoSurfaceRenderProps = {
  shouldPlay: boolean;
  videoId: string;
};

export function arePlayableVideoSurfacePropsEqual(
  previousProps: PlayableVideoSurfaceRenderProps,
  nextProps: PlayableVideoSurfaceRenderProps
): boolean {
  return (
    previousProps.videoId === nextProps.videoId &&
    previousProps.shouldPlay === nextProps.shouldPlay
  );
}
