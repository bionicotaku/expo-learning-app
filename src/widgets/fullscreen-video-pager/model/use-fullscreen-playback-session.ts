import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { Transcript } from '@/entities/transcript';
import type { VideoListItem } from '@/entities/video';
import { usePlaybackRate } from '@/features/playback-settings/model/playback-settings-store';
import {
  createTransientHoldState,
  isGestureLocked,
  resolveBasePausedByUserAfterActiveChange,
  resolveEffectivePlaybackState,
  resolveTransientHoldStateAfterActiveChange,
  toggleBasePlaybackPausedByUser,
  type FullscreenHoldZone,
  type FullscreenTapZone,
  type FullscreenTransientHoldState,
} from '@/features/video-playback';

import type {
  FullscreenActivePlayerController,
  FullscreenActivePlayerSurfaceState,
} from './active-player-controller';
import {
  resolveActiveVideoChange,
  type ViewableItemToken,
} from './active-video-change';
import {
  clearFullscreenRowPlaybackHudState,
  clearFullscreenRowTransientFeedback,
  clearFullscreenRowTransientFeedbackByKind,
  getFullscreenRowPlaybackHudState,
  hideFullscreenRowPauseIndicator,
  setFullscreenRowTransientFeedback,
  showFullscreenRowPauseIndicator,
  type FullscreenRowPlaybackHudState,
  type FullscreenRowPlaybackHudStateByVideoId,
  type FullscreenRowTransientFeedback,
} from './row-playback-hud-state';
import {
  resolveTranscriptSentenceSeekTarget,
  type TranscriptSentenceSeekDirection,
} from './transcript-sentence-seek-target';

const transientSeekDurationMs = 700;
const pauseIndicatorVisibilityDurationMs = 3000;
const fallbackSeekDeltaSeconds = 5;

type FullscreenPlaybackSessionArgs = {
  activeTranscript: Transcript | null;
  items: VideoListItem[];
  onActiveVideoChange: (itemId: string, index: number) => void;
};

type FullscreenRowRenderState = {
  activeVisitToken: number | null;
  accessibilityLabel: string;
  effectivePlaybackState: ReturnType<typeof resolveEffectivePlaybackState>;
  hudState: FullscreenRowPlaybackHudState;
  shouldEnableBackgroundGestures: boolean;
};

export function useFullscreenPlaybackSession({
  activeTranscript,
  items,
  onActiveVideoChange,
}: FullscreenPlaybackSessionArgs) {
  const activePlayerControllerRef = useRef<FullscreenActivePlayerController | null>(null);
  const activeTranscriptRef = useRef<Transcript | null>(activeTranscript);
  const basePausedByUserRef = useRef(false);
  const isMountedRef = useRef(true);
  const nextPlaybackHoldIdRef = useRef(0);
  const playbackHoldIdsRef = useRef(new Set<number>());
  const transientHoldStateRef = useRef<FullscreenTransientHoldState | null>(null);
  const pauseIndicatorTimeoutsRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const transientFeedbackTimeoutsRef = useRef(
    new Map<string, ReturnType<typeof setTimeout>>()
  );
  const onActiveVideoChangeRef = useRef(onActiveVideoChange);
  const activeVisitTokenRef = useRef(0);
  const activeSnapshotRef = useRef<{
    index: number | null;
    itemId: string | null;
  }>({
    index: null,
    itemId: null,
  });
  onActiveVideoChangeRef.current = onActiveVideoChange;
  activeTranscriptRef.current = activeTranscript;

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeVisitToken, setActiveVisitToken] = useState<number | null>(null);
  const [basePausedByUser, setBasePausedByUser] = useState(false);
  const [playbackHoldCount, setPlaybackHoldCount] = useState(0);
  const [transientHoldState, setTransientHoldState] =
    useState<FullscreenTransientHoldState | null>(null);
  const [activeSurfaceState, setActiveSurfaceState] =
    useState<FullscreenActivePlayerSurfaceState | null>(null);
  const [rowPlaybackHudStateByVideoId, setRowPlaybackHudStateByVideoId] =
    useState<FullscreenRowPlaybackHudStateByVideoId>({});
  const defaultPlaybackRate = usePlaybackRate();

  const activeItemId = useMemo(
    () => (activeIndex === null ? null : (items[activeIndex]?.videoId ?? null)),
    [activeIndex, items]
  );

  const clearPauseIndicatorTimeoutForVideo = useCallback((videoId: string) => {
    const timeout = pauseIndicatorTimeoutsRef.current.get(videoId);
    if (!timeout) {
      return;
    }

    clearTimeout(timeout);
    pauseIndicatorTimeoutsRef.current.delete(videoId);
  }, []);

  const clearTransientFeedbackTimeoutForVideo = useCallback((videoId: string) => {
    const timeout = transientFeedbackTimeoutsRef.current.get(videoId);
    if (!timeout) {
      return;
    }

    clearTimeout(timeout);
    transientFeedbackTimeoutsRef.current.delete(videoId);
  }, []);

  const showPauseIndicatorForVideo = useCallback(
    (videoId: string) => {
      clearPauseIndicatorTimeoutForVideo(videoId);
      setRowPlaybackHudStateByVideoId((currentStore) =>
        showFullscreenRowPauseIndicator(currentStore, videoId)
      );
      pauseIndicatorTimeoutsRef.current.set(
        videoId,
        setTimeout(() => {
          setRowPlaybackHudStateByVideoId((currentStore) =>
            hideFullscreenRowPauseIndicator(currentStore, videoId)
          );
          pauseIndicatorTimeoutsRef.current.delete(videoId);
        }, pauseIndicatorVisibilityDurationMs)
      );
    },
    [clearPauseIndicatorTimeoutForVideo]
  );

  const hidePauseIndicatorForVideo = useCallback(
    (videoId: string) => {
      clearPauseIndicatorTimeoutForVideo(videoId);
      setRowPlaybackHudStateByVideoId((currentStore) =>
        hideFullscreenRowPauseIndicator(currentStore, videoId)
      );
    },
    [clearPauseIndicatorTimeoutForVideo]
  );

  const setTransientFeedbackForVideo = useCallback(
    (videoId: string, transientFeedback: FullscreenRowTransientFeedback) => {
      clearTransientFeedbackTimeoutForVideo(videoId);
      setRowPlaybackHudStateByVideoId((currentStore) =>
        setFullscreenRowTransientFeedback(currentStore, videoId, transientFeedback)
      );

      if (transientFeedback.kind !== 'seek') {
        return;
      }

      transientFeedbackTimeoutsRef.current.set(
        videoId,
        setTimeout(() => {
          setRowPlaybackHudStateByVideoId((currentStore) =>
            clearFullscreenRowTransientFeedback(currentStore, videoId)
          );
          transientFeedbackTimeoutsRef.current.delete(videoId);
        }, transientSeekDurationMs)
      );
    },
    [clearTransientFeedbackTimeoutForVideo]
  );

  const clearTransientFeedbackByKindForVideo = useCallback(
    (videoId: string, kind: FullscreenRowTransientFeedback['kind']) => {
      clearTransientFeedbackTimeoutForVideo(videoId);
      setRowPlaybackHudStateByVideoId((currentStore) =>
        clearFullscreenRowTransientFeedbackByKind(currentStore, videoId, kind)
      );
    },
    [clearTransientFeedbackTimeoutForVideo]
  );

  const handleRowUnmount = useCallback(
    (videoId: string) => {
      clearPauseIndicatorTimeoutForVideo(videoId);
      clearTransientFeedbackTimeoutForVideo(videoId);
      setRowPlaybackHudStateByVideoId((currentStore) =>
        clearFullscreenRowPlaybackHudState(currentStore, videoId)
      );
    },
    [clearPauseIndicatorTimeoutForVideo, clearTransientFeedbackTimeoutForVideo]
  );

  useEffect(() => {
    const pauseIndicatorTimeouts = pauseIndicatorTimeoutsRef.current;
    const playbackHoldIds = playbackHoldIdsRef.current;
    const transientFeedbackTimeouts = transientFeedbackTimeoutsRef.current;

    return () => {
      isMountedRef.current = false;
      playbackHoldIds.clear();

      for (const timeout of pauseIndicatorTimeouts.values()) {
        clearTimeout(timeout);
      }
      pauseIndicatorTimeouts.clear();

      for (const timeout of transientFeedbackTimeouts.values()) {
        clearTimeout(timeout);
      }
      transientFeedbackTimeouts.clear();
    };
  }, []);

  const acquirePlaybackHold = useCallback(() => {
    const holdId = nextPlaybackHoldIdRef.current;
    nextPlaybackHoldIdRef.current += 1;
    playbackHoldIdsRef.current.add(holdId);
    setPlaybackHoldCount(playbackHoldIdsRef.current.size);

    let hasReleased = false;

    return () => {
      if (hasReleased) {
        return;
      }

      hasReleased = true;
      playbackHoldIdsRef.current.delete(holdId);

      if (isMountedRef.current) {
        setPlaybackHoldCount(playbackHoldIdsRef.current.size);
      }
    };
  }, []);

  const registerActiveController = useCallback(
    (controller: FullscreenActivePlayerController | null) => {
      activePlayerControllerRef.current = controller;
      setActiveSurfaceState(controller?.surfaceState ?? null);
    },
    []
  );

  const commitActiveVideo = useCallback(
    (itemId: string, index: number) => {
      const currentSnapshot = activeSnapshotRef.current;
      if (currentSnapshot.index === index && currentSnapshot.itemId === itemId) {
        return;
      }

      const nextBasePausedByUser = resolveBasePausedByUserAfterActiveChange({
        currentActiveIndex: currentSnapshot.index,
        nextActiveIndex: index,
        basePausedByUser: basePausedByUserRef.current,
      });
      const nextTransientHoldState = resolveTransientHoldStateAfterActiveChange({
        currentActiveIndex: currentSnapshot.index,
        nextActiveIndex: index,
        transientHoldState: transientHoldStateRef.current,
      });

      if (currentSnapshot.itemId) {
        clearTransientFeedbackByKindForVideo(currentSnapshot.itemId, 'rate');
      }

      activePlayerControllerRef.current = null;
      setActiveSurfaceState(null);
      basePausedByUserRef.current = nextBasePausedByUser;
      transientHoldStateRef.current = nextTransientHoldState;
      setBasePausedByUser(nextBasePausedByUser);
      setTransientHoldState(nextTransientHoldState);

      activeSnapshotRef.current = {
        index,
        itemId,
      };
      activeVisitTokenRef.current += 1;
      setActiveIndex(index);
      setActiveVisitToken(activeVisitTokenRef.current);
      onActiveVideoChangeRef.current(itemId, index);
    },
    [clearTransientFeedbackByKindForVideo]
  );

  const handleViewableItemsChanged = useCallback(
    ({
      viewableItems,
    }: {
      viewableItems: ViewableItemToken<VideoListItem>[];
    }) => {
      const currentSnapshot = activeSnapshotRef.current;
      const nextActiveVideo = resolveActiveVideoChange({
        currentActiveIndex: currentSnapshot.index,
        currentActiveItemId: currentSnapshot.itemId,
        viewableItems,
      });

      if (!nextActiveVideo) {
        return;
      }

      commitActiveVideo(nextActiveVideo.itemId, nextActiveVideo.index);
    },
    [commitActiveVideo]
  );

  const handleSingleTap = useCallback(() => {
    if (isGestureLocked(transientHoldStateRef.current)) {
      return;
    }

    const currentItemId = activeSnapshotRef.current.itemId;
    if (!currentItemId) {
      return;
    }

    const nextBasePausedByUser = toggleBasePlaybackPausedByUser(
      basePausedByUserRef.current
    );
    basePausedByUserRef.current = nextBasePausedByUser;
    setBasePausedByUser(nextBasePausedByUser);

    if (nextBasePausedByUser) {
      showPauseIndicatorForVideo(currentItemId);
      return;
    }

    hidePauseIndicatorForVideo(currentItemId);
  }, [hidePauseIndicatorForVideo, showPauseIndicatorForVideo]);

  const handleDoubleTap = useCallback(
    (zone: FullscreenTapZone) => {
      if (isGestureLocked(transientHoldStateRef.current)) {
        return;
      }

      const currentItemId = activeSnapshotRef.current.itemId;
      const activePlayerController = activePlayerControllerRef.current;
      if (!currentItemId || !activePlayerController) {
        return;
      }

      const direction: TranscriptSentenceSeekDirection =
        zone === 'left' ? 'backward' : 'forward';
      const currentTimeSeconds = activePlayerController.getCurrentTimeSeconds();
      const durationSeconds = activePlayerController.getDurationSeconds();
      const sentenceSeekTarget =
        currentTimeSeconds === null || durationSeconds === null
          ? null
          : resolveTranscriptSentenceSeekTarget({
              currentTimeMs: currentTimeSeconds * 1000,
              direction,
              durationMs: durationSeconds * 1000,
              sentences: activeTranscriptRef.current?.sentences ?? [],
            });

      if (sentenceSeekTarget) {
        if (!activePlayerController.seekTo(sentenceSeekTarget.targetTimeMs / 1000)) {
          return;
        }

        setTransientFeedbackForVideo(currentItemId, {
          kind: 'seek',
          direction,
        });
        return;
      }

      const deltaSeconds =
        direction === 'backward' ? -fallbackSeekDeltaSeconds : fallbackSeekDeltaSeconds;
      if (!activePlayerController.seekBy(deltaSeconds)) {
        return;
      }

      setTransientFeedbackForVideo(currentItemId, {
        kind: 'seek',
        direction,
      });
    },
    [setTransientFeedbackForVideo]
  );

  const handleHoldStart = useCallback(
    (zone: FullscreenHoldZone) => {
      const currentItemId = activeSnapshotRef.current.itemId;
      if (!currentItemId) {
        return;
      }

      const nextTransientHoldState = createTransientHoldState({
        basePausedByUser: basePausedByUserRef.current,
        zone,
      });

      transientHoldStateRef.current = nextTransientHoldState;
      setTransientHoldState(nextTransientHoldState);

      if (zone === 'left' || zone === 'right') {
        setTransientFeedbackForVideo(currentItemId, {
          kind: 'rate',
          label: '2x',
        });
      }
    },
    [setTransientFeedbackForVideo]
  );

  const handleHoldEnd = useCallback(() => {
    if (!transientHoldStateRef.current) {
      return;
    }

    const currentItemId = activeSnapshotRef.current.itemId;
    transientHoldStateRef.current = null;
    setTransientHoldState(null);

    if (!currentItemId) {
      return;
    }

    clearTransientFeedbackByKindForVideo(currentItemId, 'rate');
  }, [clearTransientFeedbackByKindForVideo]);

  const getRowRenderState = useCallback(
    (videoId: string, index: number): FullscreenRowRenderState => {
      const effectivePlaybackState = resolveEffectivePlaybackState({
        activeIndex,
        basePausedByUser,
        defaultPlaybackRate,
        isPlaybackHeld: playbackHoldCount > 0,
        itemIndex: index,
        transientHoldState,
      });
      const isCurrentActiveItem = videoId === activeItemId;

      return {
        activeVisitToken: isCurrentActiveItem ? activeVisitToken : null,
        accessibilityLabel: effectivePlaybackState.shouldPlay
          ? 'Pause video'
          : 'Play video',
        effectivePlaybackState,
        hudState: getFullscreenRowPlaybackHudState(
          rowPlaybackHudStateByVideoId,
          videoId
        ),
        shouldEnableBackgroundGestures:
          isCurrentActiveItem && activeSurfaceState !== 'error',
      };
    },
    [
      activeIndex,
      activeItemId,
      activeVisitToken,
      activeSurfaceState,
      basePausedByUser,
      defaultPlaybackRate,
      playbackHoldCount,
      rowPlaybackHudStateByVideoId,
      transientHoldState,
    ]
  );

  return {
    activeIndex,
    activeItemId,
    activeSurfaceState,
    acquirePlaybackHold,
    basePausedByUser,
    commitActiveVideo,
    getRowRenderState,
    handleDoubleTap,
    handleHoldEnd,
    handleHoldStart,
    handleRowUnmount,
    handleSingleTap,
    handleViewableItemsChanged,
    registerActiveController,
  };
}
