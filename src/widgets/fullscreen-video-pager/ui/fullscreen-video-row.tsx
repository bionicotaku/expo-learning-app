import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';

import type { FeedItem } from '@/entities/feed';
import type {
  FullscreenHoldZone,
  FullscreenTapZone,
} from '@/features/video-playback';
import {
  resolveRowHudCenterOwner,
  rowHudFadeOutDurationMs,
  shouldReserveCenterForPause,
} from '../model/row-hud-layout';
import type { FullscreenVideoOverlayActionItem } from '../model/overlay-data';
import {
  areFullscreenVideoRowRenderPropsEqual,
  type FullscreenVideoRowRenderProps,
} from '../model/render-props';
import type { FullscreenRowPlaybackHudState } from '../model/row-playback-hud-state';
import { createRowPlaybackSeekBarStore } from '../model/row-playback-seek-bar-store';
import type { FullscreenRowSurfacePresentation } from '../model/row-surface-presentation';
import type { FullscreenActivePlayerController } from '../model/active-player-controller';
import { RowPlaybackHudOverlay } from './row-playback-hud-overlay';
import { RowPlaybackInteractionLayer } from './row-playback-interaction-layer';
import { RowPlaybackMediaLayer } from './row-playback-media-layer';
import { RowOwnedVideoOverlay } from './row-owned-video-overlay';
import { RowSurfaceStatusOverlay } from './row-surface-status-overlay';

type FullscreenVideoRowProps = {
  accessibilityLabel: string;
  bottomInset: number;
  height: number;
  hudState: FullscreenRowPlaybackHudState;
  isActive: boolean;
  onActionPress?: (item: FullscreenVideoOverlayActionItem) => void;
  onDoubleTap: (zone: FullscreenTapZone) => void;
  onHoldEnd: () => void;
  onHoldStart: (zone: FullscreenHoldZone) => void;
  onRowUnmount: (videoId: string) => void;
  onSingleTap: () => void;
  playbackRate: number;
  registerActiveController?:
    | ((controller: FullscreenActivePlayerController | null) => void)
    | undefined;
  shouldEnableBackgroundGestures: boolean;
  shouldUsePlayer: boolean;
  shouldPlay: boolean;
  video: FeedItem;
  width: number;
};

function FullscreenVideoRowComponent({
  accessibilityLabel,
  video,
  width,
  height,
  bottomInset,
  hudState,
  isActive,
  onActionPress,
  onDoubleTap,
  onHoldEnd,
  onHoldStart,
  onRowUnmount,
  onSingleTap,
  playbackRate,
  registerActiveController,
  shouldEnableBackgroundGestures,
  shouldUsePlayer,
  shouldPlay,
}: FullscreenVideoRowProps) {
  const [surfacePresentation, setSurfacePresentation] =
    useState<FullscreenRowSurfacePresentation | null>(null);
  const [pauseCenterReserved, setPauseCenterReserved] = useState(false);
  const pauseCenterReservationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seekBarStore = useMemo(() => createRowPlaybackSeekBarStore(), []);
  const showCenteredPause = shouldReserveCenterForPause({
    pauseVisible: hudState.pauseIndicatorVisible,
    transientFeedbackKind: hudState.transientFeedback?.kind ?? null,
  });
  const centerOwner = resolveRowHudCenterOwner({
    pauseExitReserved: pauseCenterReserved,
    pauseVisible: showCenteredPause,
    surfaceState: surfacePresentation?.surfaceState ?? null,
  });

  useEffect(() => {
    return () => {
      onRowUnmount(video.videoId);
    };
  }, [onRowUnmount, video.videoId]);

  useEffect(() => {
    return () => {
      if (pauseCenterReservationTimeoutRef.current) {
        clearTimeout(pauseCenterReservationTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (pauseCenterReservationTimeoutRef.current) {
      clearTimeout(pauseCenterReservationTimeoutRef.current);
      pauseCenterReservationTimeoutRef.current = null;
    }

    if (showCenteredPause) {
      setPauseCenterReserved(true);
      return;
    }

    if (!pauseCenterReserved) {
      return;
    }

    pauseCenterReservationTimeoutRef.current = setTimeout(() => {
      setPauseCenterReserved(false);
      pauseCenterReservationTimeoutRef.current = null;
    }, rowHudFadeOutDurationMs);
  }, [pauseCenterReserved, showCenteredPause]);

  return (
    <View
      style={{
        width,
        height,
        backgroundColor: '#000000',
      }}
    >
      <RowPlaybackMediaLayer
        isActive={isActive}
        onSurfacePresentationChange={setSurfacePresentation}
        playbackRate={playbackRate}
        registerActiveController={registerActiveController}
        seekBarStore={seekBarStore}
        shouldPlay={shouldPlay}
        shouldUsePlayer={shouldUsePlayer}
        video={video}
      />

      {isActive ? (
        <RowPlaybackInteractionLayer
          accessibilityLabel={accessibilityLabel}
          bottomInset={bottomInset}
          onDoubleTap={onDoubleTap}
          onHoldEnd={onHoldEnd}
          onHoldStart={onHoldStart}
          onSingleTap={onSingleTap}
          seekBarStore={seekBarStore}
          shouldEnableBackgroundGestures={shouldEnableBackgroundGestures}
          surfaceState={surfacePresentation?.surfaceState ?? null}
          width={width}
        />
      ) : null}

      <RowOwnedVideoOverlay
        bottomInset={bottomInset}
        description={video.description}
        onActionPress={onActionPress}
        title={video.title}
      />
      <RowPlaybackHudOverlay
        hudState={hudState}
        showCenteredPause={showCenteredPause}
      />
      <RowSurfaceStatusOverlay
        centerOwner={centerOwner}
        presentation={surfacePresentation}
      />
    </View>
  );
}

function areFullscreenVideoRowComponentPropsEqual(
  previousProps: FullscreenVideoRowProps,
  nextProps: FullscreenVideoRowProps
): boolean {
  const previousRenderProps: FullscreenVideoRowRenderProps = {
    videoId: previousProps.video.videoId,
    width: previousProps.width,
    height: previousProps.height,
    hudPauseIndicatorVisible: previousProps.hudState.pauseIndicatorVisible,
    hudTransientFeedbackKind: previousProps.hudState.transientFeedback?.kind ?? null,
    hudTransientSeekDeltaSeconds:
      previousProps.hudState.transientFeedback?.kind === 'seek'
        ? previousProps.hudState.transientFeedback.deltaSeconds
        : null,
    isActive: previousProps.isActive,
    playbackRate: previousProps.playbackRate,
    shouldEnableBackgroundGestures: previousProps.shouldEnableBackgroundGestures,
    shouldUsePlayer: previousProps.shouldUsePlayer,
    shouldPlay: previousProps.shouldPlay,
  };
  const nextRenderProps: FullscreenVideoRowRenderProps = {
    videoId: nextProps.video.videoId,
    width: nextProps.width,
    height: nextProps.height,
    hudPauseIndicatorVisible: nextProps.hudState.pauseIndicatorVisible,
    hudTransientFeedbackKind: nextProps.hudState.transientFeedback?.kind ?? null,
    hudTransientSeekDeltaSeconds:
      nextProps.hudState.transientFeedback?.kind === 'seek'
        ? nextProps.hudState.transientFeedback.deltaSeconds
        : null,
    isActive: nextProps.isActive,
    playbackRate: nextProps.playbackRate,
    shouldEnableBackgroundGestures: nextProps.shouldEnableBackgroundGestures,
    shouldUsePlayer: nextProps.shouldUsePlayer,
    shouldPlay: nextProps.shouldPlay,
  };

  return (
    areFullscreenVideoRowRenderPropsEqual(previousRenderProps, nextRenderProps) &&
    previousProps.bottomInset === nextProps.bottomInset &&
    previousProps.video.videoUrl === nextProps.video.videoUrl &&
    previousProps.video.title === nextProps.video.title &&
    previousProps.video.description === nextProps.video.description
  );
}

export const FullscreenVideoRow = memo(
  FullscreenVideoRowComponent,
  areFullscreenVideoRowComponentPropsEqual
);
