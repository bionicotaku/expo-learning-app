import { useEvent, useEventListener } from 'expo';
import { VideoView, useVideoPlayer } from 'expo-video';
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';

import type { VideoListItem } from '@/entities/video';
import {
  resolveActivePlayerSurfaceState,
  type FullscreenActivePlayerController,
} from '../model/active-player-controller';
import {
  arePlayableVideoSurfacePropsEqual,
  type PlayableVideoSurfaceRenderProps,
} from '../model/render-props';
import {
  createFullscreenRowProgressSnapshot,
  type FullscreenRowProgressSnapshot,
} from '../model/row-progress-snapshot';
import type { FullscreenRowSeekController } from '../model/row-playback-seek-bar-store';
import type { FullscreenRowSurfacePresentation } from '../model/row-surface-presentation';

type PlayableVideoSurfaceProps = {
  onActiveProgressSnapshotChange?:
    | ((snapshot: FullscreenRowProgressSnapshot | null) => void)
    | undefined;
  onSurfacePresentationChange?:
    | ((presentation: FullscreenRowSurfacePresentation | null) => void)
    | undefined;
  playbackRate: number;
  registerActiveController?:
    | ((controller: FullscreenActivePlayerController | null) => void)
    | undefined;
  registerSeekController?:
    | ((controller: FullscreenRowSeekController | null) => void)
    | undefined;
  shouldPlay: boolean;
  video: VideoListItem;
};

function PlayableVideoSurfaceComponent({
  onActiveProgressSnapshotChange,
  onSurfacePresentationChange,
  playbackRate,
  registerActiveController,
  registerSeekController,
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
  const progressResyncTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearProgressResyncTimeouts = useCallback(() => {
    for (const timeout of progressResyncTimeoutsRef.current) {
      clearTimeout(timeout);
    }
    progressResyncTimeoutsRef.current = [];
  }, []);

  const emitCurrentProgressSnapshot = useCallback(() => {
    if (!onActiveProgressSnapshotChange) {
      return;
    }

    onActiveProgressSnapshotChange(
      createFullscreenRowProgressSnapshot({
        bufferedPositionSeconds: player.bufferedPosition,
        currentTimeSeconds: player.currentTime,
        durationSeconds: player.duration,
      })
    );
  }, [onActiveProgressSnapshotChange, player]);

  const scheduleProgressResync = useCallback(() => {
    if (!onActiveProgressSnapshotChange) {
      return;
    }

    clearProgressResyncTimeouts();
    progressResyncTimeoutsRef.current = [0, 50, 120].map((delayMs) =>
      setTimeout(() => {
        emitCurrentProgressSnapshot();
      }, delayMs)
    );
  }, [clearProgressResyncTimeouts, emitCurrentProgressSnapshot, onActiveProgressSnapshotChange]);

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
    emitCurrentProgressSnapshot();
    scheduleProgressResync();
    return true;
  }, [emitCurrentProgressSnapshot, player, scheduleProgressResync, status]);

  const seekTo = useCallback((seconds: number): boolean => {
    if (status !== 'readyToPlay') {
      return false;
    }

    player.currentTime = seconds;
    emitCurrentProgressSnapshot();
    scheduleProgressResync();
    return true;
  }, [emitCurrentProgressSnapshot, player, scheduleProgressResync, status]);

  const activeController = useMemo<FullscreenActivePlayerController>(
    () => ({
      seekBy,
      surfaceState: surfaceState,
    }),
    [seekBy, surfaceState]
  );
  const seekController = useMemo<FullscreenRowSeekController>(
    () => ({
      seekTo,
    }),
    [seekTo]
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

  useLayoutEffect(() => {
    if (!registerSeekController) {
      return;
    }

    registerSeekController(seekController);
    return () => {
      registerSeekController(null);
    };
  }, [registerSeekController, seekController]);

  useEffect(() => {
    player.timeUpdateEventInterval = onActiveProgressSnapshotChange ? 0.25 : 0;
  }, [onActiveProgressSnapshotChange, player]);

  useEffect(() => {
    if (!onActiveProgressSnapshotChange) {
      clearProgressResyncTimeouts();
    }
  }, [clearProgressResyncTimeouts, onActiveProgressSnapshotChange]);

  useEffect(() => {
    return clearProgressResyncTimeouts;
  }, [clearProgressResyncTimeouts, player]);

  useEffect(() => {
    if (!onActiveProgressSnapshotChange || status !== 'readyToPlay') {
      return;
    }

    emitCurrentProgressSnapshot();
    scheduleProgressResync();
  }, [
    emitCurrentProgressSnapshot,
    onActiveProgressSnapshotChange,
    scheduleProgressResync,
    status,
  ]);

  useEventListener(player, 'timeUpdate', (payload) => {
    if (!onActiveProgressSnapshotChange) {
      return;
    }

    onActiveProgressSnapshotChange(
      createFullscreenRowProgressSnapshot({
        bufferedPositionSeconds: payload.bufferedPosition,
        currentTimeSeconds: payload.currentTime,
        durationSeconds: player.duration,
      })
    );
  });

  const retry = useCallback(() => {
    void player.replaceAsync(video.videoUrl);
  }, [player, video.videoUrl]);

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
        allowsVideoFrameAnalysis={false}
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
    previousProps.onActiveProgressSnapshotChange ===
      nextProps.onActiveProgressSnapshotChange &&
    previousProps.onSurfacePresentationChange === nextProps.onSurfacePresentationChange &&
    previousProps.registerActiveController === nextProps.registerActiveController &&
    previousProps.registerSeekController === nextProps.registerSeekController
  );
}

export const PlayableVideoSurface = memo(
  PlayableVideoSurfaceComponent,
  arePlayableVideoSurfaceComponentPropsEqual
);
