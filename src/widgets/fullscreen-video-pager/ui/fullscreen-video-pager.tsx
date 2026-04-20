import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FlatList as FlatListType, ViewToken } from 'react-native';
import {
  ActivityIndicator,
  FlatList,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { FeedItem } from '@/entities/feed';
import {
  createTransientHoldState,
  isGestureLocked,
  resolveBasePausedByUserAfterActiveChange,
  resolveEffectivePlaybackState,
  resolveTransientHoldStateAfterActiveChange,
  shouldMountPlayer,
  toggleBasePlaybackPausedByUser,
  type FullscreenHoldZone,
  type FullscreenTapZone,
  type FullscreenTransientHoldState,
} from '@/features/video-playback';
import { resolveActiveVideoChange } from '../model/active-video-change';
import { resolveInitialFullscreenPagerPosition } from '../model/initial-positioning';
import { getFullscreenVideoLoadingState } from '../model/loading-state';
import {
  createPlaybackToggleFeedback,
  createRateFeedback,
  createSeekFeedback,
  shouldAutoDismissPlaybackFeedback,
  type FullscreenPlaybackFeedback,
} from '../model/playback-feedback';
import type {
  FullscreenActivePlayerController,
  FullscreenActivePlayerSurfaceState,
} from '../model/active-player-controller';
import { FullscreenVideoItem } from './fullscreen-video-item';
import { PlaybackFeedbackOverlay } from './playback-feedback-overlay';
import { TopChromeOverlay } from './top-chrome-overlay';

const playbackFeedbackDurationMs = 700;

export type FullscreenVideoPagerProps = {
  initialIndex: number;
  isInitialLoading: boolean;
  items: FeedItem[];
  onActiveItemChange: (itemId: string, index: number) => void;
};

export function FullscreenVideoPager({
  initialIndex,
  isInitialLoading,
  items,
  onActiveItemChange,
}: FullscreenVideoPagerProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatListType<FeedItem>>(null);
  const playbackFeedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedWithItemsRef = useRef(items.length > 0);
  const hasCompletedPostLoadAlignmentRef = useRef(false);
  const activePlayerControllerRef = useRef<FullscreenActivePlayerController | null>(null);
  const basePausedByUserRef = useRef(false);
  const transientHoldStateRef = useRef<FullscreenTransientHoldState | null>(null);
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
  const [playbackFeedback, setPlaybackFeedback] =
    useState<FullscreenPlaybackFeedback | null>(null);
  const loadingState = getFullscreenVideoLoadingState({
    itemCount: items.length,
    isInitialLoading,
  });
  const initialPosition = useMemo(
    () =>
      resolveInitialFullscreenPagerPosition({
        initialIndex,
        itemCount: items.length,
        mountedWithItems: mountedWithItemsRef.current,
        hasCompletedPostLoadAlignment: hasCompletedPostLoadAlignmentRef.current,
      }),
    [initialIndex, items.length]
  );
  const activeItem = activeIndex === null ? null : (items[activeIndex] ?? null);
  const activeItemId = activeItem?.videoId ?? null;
  const viewabilityConfigRef = useRef({
    itemVisiblePercentThreshold: 80,
  });

  const clearPlaybackFeedback = useCallback(() => {
    if (playbackFeedbackTimeoutRef.current) {
      clearTimeout(playbackFeedbackTimeoutRef.current);
      playbackFeedbackTimeoutRef.current = null;
    }

    setPlaybackFeedback(null);
  }, []);

  const showPlaybackFeedback = useCallback((nextFeedback: FullscreenPlaybackFeedback) => {
    if (playbackFeedbackTimeoutRef.current) {
      clearTimeout(playbackFeedbackTimeoutRef.current);
      playbackFeedbackTimeoutRef.current = null;
    }

    setPlaybackFeedback(nextFeedback);
    if (!shouldAutoDismissPlaybackFeedback(nextFeedback)) {
      return;
    }

    playbackFeedbackTimeoutRef.current = setTimeout(() => {
      setPlaybackFeedback(null);
      playbackFeedbackTimeoutRef.current = null;
    }, playbackFeedbackDurationMs);
  }, []);

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

      activePlayerControllerRef.current = null;
      setActiveSurfaceState(null);
      basePausedByUserRef.current = nextBasePausedByUser;
      transientHoldStateRef.current = nextTransientHoldState;
      setBasePausedByUser(nextBasePausedByUser);
      setTransientHoldState(nextTransientHoldState);
      clearPlaybackFeedback();

      activeSnapshotRef.current = {
        index,
        itemId,
      };
      setActiveIndex(index);
      onActiveItemChange(itemId, index);
    },
    [clearPlaybackFeedback, onActiveItemChange]
  );

  useEffect(() => {
    return () => {
      if (playbackFeedbackTimeoutRef.current) {
        clearTimeout(playbackFeedbackTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!initialPosition.shouldRunPostLoadAlignment) {
      return;
    }

    const timer = setTimeout(() => {
      listRef.current?.scrollToIndex({
        animated: false,
        index: initialPosition.targetIndex,
      });
      hasCompletedPostLoadAlignmentRef.current = true;
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [initialPosition]);

  useEffect(() => {
    if (items.length === 0 || activeSnapshotRef.current.index !== null) {
      return;
    }

    const nextItem = items[initialPosition.targetIndex];
    if (!nextItem) {
      return;
    }

    commitActiveVideo(nextItem.videoId, initialPosition.targetIndex);
  }, [commitActiveVideo, initialPosition.targetIndex, items]);

  const handleRegisterActiveController = useCallback(
    (controller: FullscreenActivePlayerController | null) => {
      activePlayerControllerRef.current = controller;
      setActiveSurfaceState(controller?.surfaceState ?? null);
    },
    []
  );

  const handleSingleTap = useCallback(() => {
    if (isGestureLocked(transientHoldStateRef.current)) {
      return;
    }

    const nextBasePausedByUser = toggleBasePlaybackPausedByUser(
      basePausedByUserRef.current
    );
    basePausedByUserRef.current = nextBasePausedByUser;
    setBasePausedByUser(nextBasePausedByUser);
    showPlaybackFeedback(createPlaybackToggleFeedback(nextBasePausedByUser));
  }, [showPlaybackFeedback]);

  const handleDoubleTap = useCallback((zone: FullscreenTapZone) => {
    if (isGestureLocked(transientHoldStateRef.current)) {
      return;
    }

    const deltaSeconds = zone === 'left' ? -5 : 5;
    if (!activePlayerControllerRef.current?.seekBy(deltaSeconds)) {
      return;
    }

    showPlaybackFeedback(createSeekFeedback(deltaSeconds));
  }, [showPlaybackFeedback]);

  const handleHoldStart = useCallback((zone: FullscreenHoldZone) => {
    const nextTransientHoldState = createTransientHoldState({
      basePausedByUser: basePausedByUserRef.current,
      zone,
    });

    transientHoldStateRef.current = nextTransientHoldState;
    setTransientHoldState(nextTransientHoldState);
    if (zone === 'left' || zone === 'right') {
      showPlaybackFeedback(createRateFeedback());
    }
  }, [showPlaybackFeedback]);

  const handleHoldEnd = useCallback(() => {
    if (!transientHoldStateRef.current) {
      return;
    }

    transientHoldStateRef.current = null;
    setTransientHoldState(null);
    clearPlaybackFeedback();
  }, [clearPlaybackFeedback]);

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<FeedItem>[] }) => {
      const nextActiveVideo = resolveActiveVideoChange({
        currentActiveIndex: activeSnapshotRef.current.index,
        currentActiveItemId: activeSnapshotRef.current.itemId,
        viewableItems,
      });

      if (!nextActiveVideo) {
        return;
      }

      commitActiveVideo(nextActiveVideo.itemId, nextActiveVideo.index);
    },
    [commitActiveVideo]
  );

  const handleScrollToIndexFailed = useCallback(({ index }: { index: number }) => {
    setTimeout(() => {
      listRef.current?.scrollToIndex({
        animated: false,
        index,
      });
    }, 60);
  }, []);

  const renderState = useMemo(
    () => ({
      activeIndex,
      activeSurfaceState,
      basePausedByUser,
      bottomInset: insets.bottom,
      height,
      transientHoldState,
      width,
    }),
    [
      activeIndex,
      activeSurfaceState,
      basePausedByUser,
      height,
      insets.bottom,
      transientHoldState,
      width,
    ]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: FeedItem; index: number }) => {
      const effectivePlaybackState = resolveEffectivePlaybackState({
        activeIndex,
        basePausedByUser,
        itemIndex: index,
        transientHoldState,
      });
      const isCurrentActiveItem = item.videoId === activeItemId;
      const accessibilityLabel = effectivePlaybackState.shouldPlay
        ? 'Pause video'
        : 'Play video';
      const shouldEnableBackgroundGestures =
        isCurrentActiveItem && activeSurfaceState !== 'error';

      return (
        <FullscreenVideoItem
          accessibilityLabel={accessibilityLabel}
          bottomInset={insets.bottom}
          height={height}
          isActive={isCurrentActiveItem}
          onDoubleTap={handleDoubleTap}
          onHoldEnd={handleHoldEnd}
          onHoldStart={handleHoldStart}
          onSingleTap={handleSingleTap}
          playbackRate={effectivePlaybackState.playbackRate}
          registerActiveController={
            isCurrentActiveItem ? handleRegisterActiveController : undefined
          }
          shouldEnableBackgroundGestures={shouldEnableBackgroundGestures}
          shouldUsePlayer={shouldMountPlayer(index, activeIndex ?? -1)}
          shouldPlay={effectivePlaybackState.shouldPlay}
          video={item}
          width={width}
        />
      );
    },
    [
      activeIndex,
      activeItemId,
      activeSurfaceState,
      basePausedByUser,
      handleDoubleTap,
      handleHoldEnd,
      handleHoldStart,
      handleRegisterActiveController,
      handleSingleTap,
      height,
      insets.bottom,
      transientHoldState,
      width,
    ]
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <FlatList
        ref={listRef}
        data={items}
        keyExtractor={(item) => item.videoId}
        renderItem={renderItem}
        // Fullscreen paging relies on exact viewport-sized items. Automatic
        // content insets shift the initial offset and break first-entry snap.
        bounces={false}
        decelerationRate="fast"
        extraData={renderState}
        getItemLayout={(_, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
        initialNumToRender={5}
        initialScrollIndex={initialPosition.initialScrollIndex}
        maxToRenderPerBatch={6}
        pagingEnabled
        onScrollToIndexFailed={handleScrollToIndexFailed}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
        viewabilityConfig={viewabilityConfigRef.current}
        windowSize={7}
        onViewableItemsChanged={handleViewableItemsChanged}
      />

      {loadingState.showInitialBottomLoader ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: insets.bottom + 42,
            alignItems: 'center',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 999,
              backgroundColor: 'rgba(0,0,0,0.68)',
            }}
          >
            <ActivityIndicator color="#FFFFFF" size="small" />
            <Text selectable style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
              Loading video feed...
            </Text>
          </View>
        </View>
      ) : null}

      <TopChromeOverlay
        activeIndex={activeIndex}
        topInset={insets.top}
        totalItems={items.length}
      />
      <PlaybackFeedbackOverlay playbackFeedback={playbackFeedback} />
    </View>
  );
}
