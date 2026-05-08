import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';

import type { Transcript, TranscriptToken } from '@/entities/transcript';
import type { VideoListItem } from '@/entities/video';
import type { VideoMeta } from '@/entities/video-meta';
import {
  useCycleSubtitleDisplayMode,
  type SubtitleDisplayMode,
} from '@/features/playback-settings';
import {
  createWordDetailDialogPayloadFromTranscriptToken,
  usePresentWordDetailDialog,
} from '@/features/word-detail';
import { useVideoRuntimeState } from '@/features/video-runtime';
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
import { resolveEffectiveEngagementCount } from '../model/engagement-count';
import {
  areFullscreenVideoRowRenderPropsEqual,
  type FullscreenVideoRowRenderProps,
} from '../model/render-props';
import type { ExpandableOverlayDescriptionMeasurementCache } from '../model/expandable-overlay-description';
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
  acquirePlaybackHold?: () => () => void;
  activeTranscript: Transcript | null;
  activeVisitToken: number | null;
  bottomInset: number;
  height: number;
  hudState: FullscreenRowPlaybackHudState;
  isActive: boolean;
  measurementCache: ExpandableOverlayDescriptionMeasurementCache;
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
  subtitleDisplayMode: SubtitleDisplayMode;
  video: VideoListItem;
  videoMeta: VideoMeta | null;
  width: number;
};

function FullscreenVideoRowComponent({
  accessibilityLabel,
  acquirePlaybackHold,
  activeTranscript,
  activeVisitToken,
  video,
  width,
  height,
  bottomInset,
  hudState,
  isActive,
  measurementCache,
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
  subtitleDisplayMode,
  videoMeta,
}: FullscreenVideoRowProps) {
  const [surfacePresentation, setSurfacePresentation] =
    useState<FullscreenRowSurfacePresentation | null>(null);
  const [pauseCenterReserved, setPauseCenterReserved] = useState(false);
  const pauseCenterReservationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seekBarStore = useMemo(() => createRowPlaybackSeekBarStore(), []);
  const presentWordDetailDialog = usePresentWordDetailDialog();
  const cycleSubtitleDisplayMode = useCycleSubtitleDisplayMode();
  const { isFavorited, isLiked, toggleFavorited, toggleLiked } = useVideoRuntimeState({
    baseIsFavorited: videoMeta?.isFavorited ?? false,
    baseIsLiked: videoMeta?.isLiked ?? false,
    videoId: video.videoId,
  });
  const areEngagementActionsDisabled = videoMeta === null;
  const effectiveLikeCount =
    videoMeta === null
      ? video.likeCount
      : resolveEffectiveEngagementCount({
          baseCount: video.likeCount,
          baseIsActive: videoMeta.isLiked,
          effectiveIsActive: isLiked,
        });
  const effectiveFavoriteCount =
    videoMeta === null
      ? video.favoriteCount
      : resolveEffectiveEngagementCount({
          baseCount: video.favoriteCount,
          baseIsActive: videoMeta.isFavorited,
          effectiveIsActive: isFavorited,
        });
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

  const handleActionPress = useCallback((item: FullscreenVideoOverlayActionItem) => {
    if (item.id === 'like') {
      if (areEngagementActionsDisabled) {
        return;
      }

      toggleLiked();
      return;
    }

    if (item.id === 'favorite') {
      if (areEngagementActionsDisabled) {
        return;
      }

      toggleFavorited();
      return;
    }

    if (item.id === 'subtitle') {
      cycleSubtitleDisplayMode();
    }
  }, [
    areEngagementActionsDisabled,
    cycleSubtitleDisplayMode,
    toggleFavorited,
    toggleLiked,
  ]);
  const handleSubtitleTokenPress = useCallback((token: TranscriptToken) => {
    const payload = createWordDetailDialogPayloadFromTranscriptToken(token);
    const releasePlaybackHold = acquirePlaybackHold?.();

    try {
      presentWordDetailDialog(payload, {
        onDismissComplete: releasePlaybackHold,
      });
    } catch (error) {
      releasePlaybackHold?.();
      throw error;
    }
  }, [acquirePlaybackHold, presentWordDetailDialog]);

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
        activeTranscript={activeTranscript}
        activeVisitToken={activeVisitToken}
        bottomInset={bottomInset}
        description={video.description}
        areEngagementActionsDisabled={areEngagementActionsDisabled}
        favoriteCount={effectiveFavoriteCount}
        isFavorited={isFavorited}
        isLiked={isLiked}
        likeCount={effectiveLikeCount}
        measurementCache={measurementCache}
        onActionPress={handleActionPress}
        onSubtitleTokenPress={handleSubtitleTokenPress}
        seekBarStore={seekBarStore}
        subtitleDisplayMode={subtitleDisplayMode}
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
    activeVisitToken: previousProps.activeVisitToken,
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
    activeVisitToken: nextProps.activeVisitToken,
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
    previousProps.videoMeta === nextProps.videoMeta &&
    previousProps.video.videoUrl === nextProps.video.videoUrl &&
    previousProps.video.title === nextProps.video.title &&
    previousProps.video.description === nextProps.video.description &&
    previousProps.video.likeCount === nextProps.video.likeCount &&
    previousProps.video.favoriteCount === nextProps.video.favoriteCount &&
    previousProps.activeTranscript === nextProps.activeTranscript &&
    previousProps.acquirePlaybackHold === nextProps.acquirePlaybackHold &&
    previousProps.subtitleDisplayMode === nextProps.subtitleDisplayMode
  );
}

export const FullscreenVideoRow = memo(
  FullscreenVideoRowComponent,
  areFullscreenVideoRowComponentPropsEqual
);
