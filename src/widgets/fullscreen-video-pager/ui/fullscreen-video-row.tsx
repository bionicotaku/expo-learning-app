import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';

import type { Transcript } from '@/entities/transcript';
import type { VideoListItem } from '@/entities/video';
import type { VideoMeta } from '@/entities/video-meta';
import {
  useCycleSubtitleDisplayMode,
  type SubtitleDisplayMode,
} from '@/features/playback-settings';
import { useVideoEngagementState } from '@/features/video-engagement';
import {
  createWordDetailDialogDataFromTranscriptToken,
  usePresentWordDetailDialog,
} from '@/features/word-detail';
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
import type { ExpandableOverlayDescriptionMeasurementCache } from '../model/expandable-overlay-description';
import type { FullscreenRowPlaybackHudState } from '../model/row-playback-hud-state';
import { createRowPlaybackSeekBarStore } from '../model/row-playback-seek-bar-store';
import type { FullscreenRowSurfacePresentation } from '../model/row-surface-presentation';
import type { FullscreenActivePlayerController } from '../model/active-player-controller';
import type { FullscreenRowProgressSnapshot } from '../model/row-progress-snapshot';
import { RowPlaybackHudOverlay } from './row-playback-hud-overlay';
import { RowPlaybackInteractionLayer } from './row-playback-interaction-layer';
import { RowPlaybackMediaLayer } from './row-playback-media-layer';
import { RowOwnedVideoOverlay } from './row-owned-video-overlay';
import { RowSurfaceStatusOverlay } from './row-surface-status-overlay';
import type { BasicSubtitleTokenPressPayload } from './basic-subtitle-overlay';

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
  onPlaybackEnd?: (videoId: string) => void;
  onWatchProgressSample?: (payload: {
    playbackRate: number;
    snapshot: FullscreenRowProgressSnapshot | null;
    videoId: string;
    watchSessionId: string | null;
  }) => void;
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
  videoDetailsVisible: boolean;
  videoMeta: VideoMeta | null;
  watchSessionId: string | null;
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
  onPlaybackEnd,
  onWatchProgressSample,
  onRowUnmount,
  onSingleTap,
  playbackRate,
  registerActiveController,
  shouldEnableBackgroundGestures,
  shouldUsePlayer,
  shouldPlay,
  subtitleDisplayMode,
  videoMeta,
  videoDetailsVisible,
  watchSessionId,
}: FullscreenVideoRowProps) {
  const [surfacePresentation, setSurfacePresentation] =
    useState<FullscreenRowSurfacePresentation | null>(null);
  const [pauseCenterReserved, setPauseCenterReserved] = useState(false);
  const pauseCenterReservationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seekBarStore = useMemo(() => createRowPlaybackSeekBarStore(), []);
  const presentWordDetailDialog = usePresentWordDetailDialog();
  const cycleSubtitleDisplayMode = useCycleSubtitleDisplayMode();
  const {
    favoriteCount,
    isFavoritePending,
    isFavorited,
    isLikePending,
    isLiked,
    likeCount,
    setFavorited,
    setLiked,
  } = useVideoEngagementState({
    baseFavoriteCount: video.favoriteCount,
    baseIsFavorited: videoMeta?.isFavorited ?? false,
    baseIsLiked: videoMeta?.isLiked ?? false,
    baseLikeCount: video.likeCount,
    isEnabled: videoMeta !== null,
    videoId: video.videoId,
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
      if (videoMeta === null || isLikePending) {
        return;
      }

      void setLiked(!isLiked);
      return;
    }

    if (item.id === 'favorite') {
      if (videoMeta === null || isFavoritePending) {
        return;
      }

      void setFavorited(!isFavorited);
      return;
    }

    if (item.id === 'subtitle') {
      cycleSubtitleDisplayMode();
    }
  }, [
    cycleSubtitleDisplayMode,
    isFavoritePending,
    isFavorited,
    isLikePending,
    isLiked,
    setFavorited,
    setLiked,
    videoMeta,
  ]);
  const handleActiveProgressSnapshotChange = useCallback(
    (snapshot: FullscreenRowProgressSnapshot | null) => {
      onWatchProgressSample?.({
        playbackRate,
        snapshot,
        videoId: video.videoId,
        watchSessionId,
      });
    },
    [onWatchProgressSample, playbackRate, video.videoId, watchSessionId]
  );
  const handlePlaybackEnd = useCallback(() => {
    onPlaybackEnd?.(video.videoId);
  }, [onPlaybackEnd, video.videoId]);
  const handleSubtitleTokenPress = useCallback(({
    sentence,
    token,
  }: BasicSubtitleTokenPressPayload) => {
    const sentenceAudio = {
      endMs: sentence.end,
      startMs: sentence.start,
      videoUrl: video.videoUrl,
    };
    const payload = createWordDetailDialogDataFromTranscriptToken(token, sentenceAudio);
    const releasePlaybackHold = acquirePlaybackHold?.();

    try {
      const didPresentWordDetailDialog = presentWordDetailDialog(payload, {
        onDismissComplete: releasePlaybackHold,
      });

      if (!didPresentWordDetailDialog) {
        releasePlaybackHold?.();
      }
    } catch (error) {
      releasePlaybackHold?.();
      throw error;
    }
  }, [acquirePlaybackHold, presentWordDetailDialog, video.videoUrl]);

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
        onActiveProgressSnapshotChange={handleActiveProgressSnapshotChange}
        onPlaybackEnd={handlePlaybackEnd}
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
        favoriteCount={favoriteCount}
        isFavoriteActionDisabled={videoMeta === null || isFavoritePending}
        isLikeActionDisabled={videoMeta === null || isLikePending}
        isFavorited={isFavorited}
        isLiked={isLiked}
        likeCount={likeCount}
        measurementCache={measurementCache}
        onActionPress={handleActionPress}
        onSubtitleTokenPress={handleSubtitleTokenPress}
        seekBarStore={seekBarStore}
        subtitleDisplayMode={subtitleDisplayMode}
        title={video.title}
        videoDetailsVisible={videoDetailsVisible}
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
    hudTransientSeekDirection:
      previousProps.hudState.transientFeedback?.kind === 'seek'
        ? previousProps.hudState.transientFeedback.direction
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
    hudTransientSeekDirection:
      nextProps.hudState.transientFeedback?.kind === 'seek'
        ? nextProps.hudState.transientFeedback.direction
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
    previousProps.watchSessionId === nextProps.watchSessionId &&
    previousProps.acquirePlaybackHold === nextProps.acquirePlaybackHold &&
    previousProps.onWatchProgressSample === nextProps.onWatchProgressSample &&
    previousProps.onPlaybackEnd === nextProps.onPlaybackEnd &&
    previousProps.subtitleDisplayMode === nextProps.subtitleDisplayMode &&
    previousProps.videoDetailsVisible === nextProps.videoDetailsVisible
  );
}

export const FullscreenVideoRow = memo(
  FullscreenVideoRowComponent,
  areFullscreenVideoRowComponentPropsEqual
);
