export type FullscreenVideoRowRenderProps = {
  height: number;
  hudPauseIndicatorVisible: boolean;
  hudTransientFeedbackKind: 'seek' | 'rate' | null;
  hudTransientSeekDeltaSeconds: -5 | 5 | null;
  isActive: boolean;
  playbackRate: number;
  shouldEnableBackgroundGestures: boolean;
  shouldUsePlayer: boolean;
  shouldPlay: boolean;
  videoId: string;
  width: number;
};

export function areFullscreenVideoRowRenderPropsEqual(
  previousProps: FullscreenVideoRowRenderProps,
  nextProps: FullscreenVideoRowRenderProps
): boolean {
  return (
    previousProps.videoId === nextProps.videoId &&
    previousProps.width === nextProps.width &&
    previousProps.height === nextProps.height &&
    previousProps.hudPauseIndicatorVisible === nextProps.hudPauseIndicatorVisible &&
    previousProps.hudTransientFeedbackKind === nextProps.hudTransientFeedbackKind &&
    previousProps.hudTransientSeekDeltaSeconds ===
      nextProps.hudTransientSeekDeltaSeconds &&
    previousProps.isActive === nextProps.isActive &&
    previousProps.playbackRate === nextProps.playbackRate &&
    previousProps.shouldEnableBackgroundGestures ===
      nextProps.shouldEnableBackgroundGestures &&
    previousProps.shouldUsePlayer === nextProps.shouldUsePlayer &&
    previousProps.shouldPlay === nextProps.shouldPlay
  );
}

export type PlayableVideoSurfaceRenderProps = {
  playbackRate: number;
  shouldPlay: boolean;
  videoId: string;
};

export function arePlayableVideoSurfacePropsEqual(
  previousProps: PlayableVideoSurfaceRenderProps,
  nextProps: PlayableVideoSurfaceRenderProps
): boolean {
  return (
    previousProps.videoId === nextProps.videoId &&
    previousProps.playbackRate === nextProps.playbackRate &&
    previousProps.shouldPlay === nextProps.shouldPlay
  );
}
