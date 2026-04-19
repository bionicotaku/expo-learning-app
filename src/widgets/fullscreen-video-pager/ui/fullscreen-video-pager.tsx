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
import { shouldMountPlayer } from '@/features/video-playback';
import { resolveActiveVideoChange } from '../model/active-video-change';
import { resolveInitialFullscreenPagerPosition } from '../model/initial-positioning';
import { getFullscreenVideoLoadingState } from '../model/loading-state';
import { ActiveVideoOverlay } from './active-video-overlay';
import { FullscreenVideoItem } from './fullscreen-video-item';
import { PlaybackFeedbackOverlay } from './playback-feedback-overlay';

const audioToastDurationMs = 700;

export type FullscreenVideoPagerProps = {
  initialIndex: number;
  isFetchingNextPage: boolean;
  isInitialLoading: boolean;
  isMuted: boolean;
  items: FeedItem[];
  onActiveItemChange: (itemId: string, index: number) => void;
  onToggleMuted: () => void;
};

export function FullscreenVideoPager({
  initialIndex,
  isFetchingNextPage,
  isInitialLoading,
  isMuted,
  items,
  onActiveItemChange,
  onToggleMuted,
}: FullscreenVideoPagerProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatListType<FeedItem>>(null);
  const audioToastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedWithItemsRef = useRef(items.length > 0);
  const hasCompletedPostLoadAlignmentRef = useRef(false);
  const activeSnapshotRef = useRef<{
    index: number | null;
    itemId: string | null;
  }>({
    index: null,
    itemId: null,
  });
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [audioToastLabel, setAudioToastLabel] = useState<string | null>(null);
  const loadingState = getFullscreenVideoLoadingState({
    itemCount: items.length,
    isFetchingNextPage,
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
  const activeItemId = activeItem?.id ?? null;
  const viewabilityConfigRef = useRef({
    itemVisiblePercentThreshold: 80,
  });

  const commitActiveVideo = useCallback(
    (itemId: string, index: number) => {
      const currentSnapshot = activeSnapshotRef.current;
      if (currentSnapshot.index === index && currentSnapshot.itemId === itemId) {
        return;
      }

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
      if (audioToastTimeoutRef.current) {
        clearTimeout(audioToastTimeoutRef.current);
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

    commitActiveVideo(nextItem.id, initialPosition.targetIndex);
  }, [commitActiveVideo, initialPosition.targetIndex, items]);

  const handleToggleMuted = useCallback(() => {
    const nextMutedValue = !isMuted;
    onToggleMuted();

    if (audioToastTimeoutRef.current) {
      clearTimeout(audioToastTimeoutRef.current);
    }

    setAudioToastLabel(nextMutedValue ? 'Muted' : 'Sound On');
    audioToastTimeoutRef.current = setTimeout(() => {
      setAudioToastLabel(null);
    }, audioToastDurationMs);
  }, [isMuted, onToggleMuted]);

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
      isMuted,
      width,
    }),
    [activeIndex, height, insets.bottom, isMuted, width]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: FeedItem; index: number }) => {
      return (
        <FullscreenVideoItem
          bottomInset={insets.bottom}
          height={height}
          isActive={item.id === activeItemId}
          isMuted={isMuted}
          onToggleMuted={handleToggleMuted}
          shouldUsePlayer={shouldMountPlayer(index, activeIndex ?? -1)}
          video={item}
          width={width}
        />
      );
    },
    [activeIndex, activeItemId, handleToggleMuted, height, insets.bottom, isMuted, width]
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <FlatList
        ref={listRef}
        data={items}
        keyExtractor={(item) => item.id}
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
        initialNumToRender={3}
        initialScrollIndex={initialPosition.initialScrollIndex}
        maxToRenderPerBatch={4}
        pagingEnabled
        onScrollToIndexFailed={handleScrollToIndexFailed}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
        viewabilityConfig={viewabilityConfigRef.current}
        windowSize={5}
        onViewableItemsChanged={handleViewableItemsChanged}
      />

      {loadingState.showInitialBottomLoader || loadingState.showPaginationBottomLoader ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom:
              activeItem && loadingState.showPaginationBottomLoader
                ? insets.bottom + 118
                : insets.bottom + 42,
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
              {loadingState.showInitialBottomLoader ? 'Loading video feed...' : 'Loading next page...'}
            </Text>
          </View>
        </View>
      ) : null}

      <ActiveVideoOverlay activeIndex={activeIndex} topInset={insets.top} totalItems={items.length} />
      <PlaybackFeedbackOverlay audioToastLabel={audioToastLabel} />
    </View>
  );
}
