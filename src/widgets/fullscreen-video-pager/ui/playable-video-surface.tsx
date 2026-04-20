import { useEvent } from 'expo';
import { VideoView, useVideoPlayer } from 'expo-video';
import { memo, useCallback, useEffect, useLayoutEffect, useMemo } from 'react';
import { View } from 'react-native';

import type { FeedItem } from '@/entities/feed';
import {
  resolveActivePlayerSurfaceState,
  type FullscreenActivePlayerController,
} from '../model/active-player-controller';
import {
  arePlayableVideoSurfacePropsEqual,
  type PlayableVideoSurfaceRenderProps,
} from '../model/render-props';
import type { FullscreenRowSurfacePresentation } from '../model/row-surface-presentation';

type PlayableVideoSurfaceProps = {
  onSurfacePresentationChange?:
    | ((presentation: FullscreenRowSurfacePresentation | null) => void)
    | undefined;
  playbackRate: number;
  registerActiveController?:
    | ((controller: FullscreenActivePlayerController | null) => void)
    | undefined;
  shouldPlay: boolean;
  video: FeedItem;
};

function PlayableVideoSurfaceComponent({
  onSurfacePresentationChange,
  playbackRate,
  registerActiveController,
  video,
  shouldPlay,
}: PlayableVideoSurfaceProps) {
  const player = useVideoPlayer(video.videoUrl, (instance) => {
    instance.loop = true;
    instance.muted = false;
  });

  const { status, error } = useEvent(player, 'statusChange', {
    status: player.status,
    error: undefined,
  });
  const surfaceState = resolveActivePlayerSurfaceState(status);

  useEffect(() => {
    player.playbackRate = playbackRate;
  }, [playbackRate, player]);

  useEffect(() => {
    if (!shouldPlay) {
      player.pause();
      return;
    }

    if (status === 'readyToPlay') {
      player.play();
    }
  }, [player, shouldPlay, status]);

  const seekBy = useCallback((seconds: number): boolean => {
    if (status !== 'readyToPlay') {
      return false;
    }

    player.seekBy(seconds);
    return true;
  }, [player, status]);

  const activeController = useMemo<FullscreenActivePlayerController>(
    () => ({
      seekBy,
      surfaceState: surfaceState,
    }),
    [seekBy, surfaceState]
  );

  useLayoutEffect(() => {
    if (!registerActiveController) {
      return;
    }

    registerActiveController(activeController);
    return () => {
      registerActiveController(null);
    };
  }, [activeController, registerActiveController]);

  const handleRetry = useCallback(async () => {
    await player.replaceAsync(video.videoUrl);

    if (shouldPlay) {
      player.play();
    }
  }, [player, shouldPlay, video.videoUrl]);

  const retry = useCallback(() => {
    void handleRetry();
  }, [handleRetry]);

  const surfacePresentation = useMemo<FullscreenRowSurfacePresentation>(
    () => ({
      errorMessage:
        surfaceState === 'error'
          ? (error?.message ?? 'The player could not load this video.')
          : null,
      retry: surfaceState === 'error' ? retry : null,
      surfaceState,
    }),
    [error?.message, retry, surfaceState]
  );

  useLayoutEffect(() => {
    if (!onSurfacePresentationChange) {
      return;
    }

    onSurfacePresentationChange(surfacePresentation);
    return () => {
      onSurfacePresentationChange(null);
    };
  }, [onSurfacePresentationChange, surfacePresentation]);

  return (
    <View style={{ width: '100%', height: '100%' }}>
      <VideoView
        player={player}
        nativeControls={false}
        contentFit="cover"
        style={{ width: '100%', height: '100%' }}
      />
    </View>
  );
}

function arePlayableVideoSurfaceComponentPropsEqual(
  previousProps: PlayableVideoSurfaceProps,
  nextProps: PlayableVideoSurfaceProps
): boolean {
  const previousRenderProps: PlayableVideoSurfaceRenderProps = {
    playbackRate: previousProps.playbackRate,
    videoId: previousProps.video.videoId,
    shouldPlay: previousProps.shouldPlay,
  };
  const nextRenderProps: PlayableVideoSurfaceRenderProps = {
    playbackRate: nextProps.playbackRate,
    videoId: nextProps.video.videoId,
    shouldPlay: nextProps.shouldPlay,
  };

  return (
    arePlayableVideoSurfacePropsEqual(previousRenderProps, nextRenderProps) &&
    previousProps.video.videoUrl === nextProps.video.videoUrl &&
    previousProps.onSurfacePresentationChange === nextProps.onSurfacePresentationChange &&
    previousProps.registerActiveController === nextProps.registerActiveController
  );
}

export const PlayableVideoSurface = memo(
  PlayableVideoSurfaceComponent,
  arePlayableVideoSurfaceComponentPropsEqual
);
