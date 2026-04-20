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
  resolvePausedByUserAfterActiveChange,
  shouldMountPlayer,
  shouldPlayVideo,
  togglePlaybackPausedByUser,
} from '@/features/video-playback';
import { resolveActiveVideoChange } from '../model/active-video-change';
import { resolveInitialFullscreenPagerPosition } from '../model/initial-positioning';
import { getFullscreenVideoLoadingState } from '../model/loading-state';
import { getPlaybackFeedbackLabel } from '../model/playback-feedback';
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
  const pausedByUserRef = useRef(false);
  const activeSnapshotRef = useRef<{
    index: number | null;
    itemId: string | null;
  }>({
    index: null,
    itemId: null,
  });
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [pausedByUser, setPausedByUser] = useState(false);
  const [playbackFeedbackLabel, setPlaybackFeedbackLabel] = useState<string | null>(null);
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

  const commitActiveVideo = useCallback(
    (itemId: string, index: number) => {
      const currentSnapshot = activeSnapshotRef.current;
      if (currentSnapshot.index === index && currentSnapshot.itemId === itemId) {
        return;
      }

      const nextPausedByUser = resolvePausedByUserAfterActiveChange({
        currentActiveIndex: currentSnapshot.index,
        nextActiveIndex: index,
        pausedByUser: pausedByUserRef.current,
      });

      pausedByUserRef.current = nextPausedByUser;
      setPausedByUser(nextPausedByUser);
      if (playbackFeedbackTimeoutRef.current) {
        clearTimeout(playbackFeedbackTimeoutRef.current);
        playbackFeedbackTimeoutRef.current = null;
      }
      setPlaybackFeedbackLabel(null);

      activeSnapshotRef.current = {
        index,
        itemId,
      };
      setActiveIndex(index);
      onActiveItemChange(itemId, index);
    },
    [onActiveItemChange]
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

  const handleTogglePlayback = useCallback(() => {
    const nextPausedByUser = togglePlaybackPausedByUser(pausedByUserRef.current);

    pausedByUserRef.current = nextPausedByUser;
    setPausedByUser(nextPausedByUser);
    setPlaybackFeedbackLabel(getPlaybackFeedbackLabel(nextPausedByUser));

    if (playbackFeedbackTimeoutRef.current) {
      clearTimeout(playbackFeedbackTimeoutRef.current);
    }

    playbackFeedbackTimeoutRef.current = setTimeout(() => {
      setPlaybackFeedbackLabel(null);
    }, playbackFeedbackDurationMs);
  }, []);

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
      bottomInset: insets.bottom,
      height,
      pausedByUser,
      width,
    }),
    [activeIndex, height, insets.bottom, pausedByUser, width]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: FeedItem; index: number }) => {
      const shouldPlay = shouldPlayVideo({
        activeIndex,
        itemIndex: index,
        pausedByUser,
      });

      return (
        <FullscreenVideoItem
          bottomInset={insets.bottom}
          height={height}
          isActive={item.videoId === activeItemId}
          onTogglePlayback={handleTogglePlayback}
          shouldUsePlayer={shouldMountPlayer(index, activeIndex ?? -1)}
          shouldPlay={shouldPlay}
          video={item}
          width={width}
        />
      );
    },
    [
      activeIndex,
      activeItemId,
      handleTogglePlayback,
      height,
      insets.bottom,
      pausedByUser,
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
      <PlaybackFeedbackOverlay playbackFeedbackLabel={playbackFeedbackLabel} />
    </View>
  );
}
