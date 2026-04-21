import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { VideoListItem } from '@/entities/video';
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

const transientSeekDurationMs = 700;
const pauseIndicatorVisibilityDurationMs = 3000;

type FullscreenPlaybackSessionArgs = {
  items: VideoListItem[];
  onActiveVideoChange: (itemId: string, index: number) => void;
};

type FullscreenRowRenderState = {
  accessibilityLabel: string;
  effectivePlaybackState: ReturnType<typeof resolveEffectivePlaybackState>;
  hudState: FullscreenRowPlaybackHudState;
  shouldEnableBackgroundGestures: boolean;
};

export function useFullscreenPlaybackSession({
  items,
  onActiveVideoChange,
}: FullscreenPlaybackSessionArgs) {
  const activePlayerControllerRef = useRef<FullscreenActivePlayerController | null>(null);
  const basePausedByUserRef = useRef(false);
  const transientHoldStateRef = useRef<FullscreenTransientHoldState | null>(null);
  const pauseIndicatorTimeoutsRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const transientFeedbackTimeoutsRef = useRef(
    new Map<string, ReturnType<typeof setTimeout>>()
  );
  const activeSnapshotRef = useRef<{
    index: number | null;
    itemId: string | null;
  }>({
    index: null,
    itemId: null,
  });

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [basePausedByUser, setBasePausedByUser] = useState(false);
  const [transientHoldState, setTransientHoldState] =
    useState<FullscreenTransientHoldState | null>(null);
  const [activeSurfaceState, setActiveSurfaceState] =
    useState<FullscreenActivePlayerSurfaceState | null>(null);
  const [rowPlaybackHudStateByVideoId, setRowPlaybackHudStateByVideoId] =
    useState<FullscreenRowPlaybackHudStateByVideoId>({});

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
    const transientFeedbackTimeouts = transientFeedbackTimeoutsRef.current;

    return () => {
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
      setActiveIndex(index);
      onActiveVideoChange(itemId, index);
    },
    [clearTransientFeedbackByKindForVideo, onActiveVideoChange]
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
      if (!currentItemId) {
        return;
      }

      const deltaSeconds = zone === 'left' ? -5 : 5;
      if (!activePlayerControllerRef.current?.seekBy(deltaSeconds)) {
        return;
      }

      setTransientFeedbackForVideo(currentItemId, {
        kind: 'seek',
        deltaSeconds,
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
        itemIndex: index,
        transientHoldState,
      });
      const isCurrentActiveItem = videoId === activeItemId;

      return {
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
      activeSurfaceState,
      basePausedByUser,
      rowPlaybackHudStateByVideoId,
      transientHoldState,
    ]
  );

  return {
    activeIndex,
    activeItemId,
    activeSurfaceState,
    basePausedByUser,
    commitActiveVideo,
    getRowRenderState,
    handleDoubleTap,
    handleHoldEnd,
    handleHoldStart,
    handleRowUnmount,
    handleSingleTap,
    registerActiveController,
  };
}
