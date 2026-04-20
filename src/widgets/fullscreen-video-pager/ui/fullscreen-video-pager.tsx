import { useCallback, useEffect, useMemo, useRef } from 'react';
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
import { useFullscreenPlaybackSession } from '../model/use-fullscreen-playback-session';
import { FullscreenVideoRow } from './fullscreen-video-row';
import { TopChromeOverlay } from './top-chrome-overlay';

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
  const mountedWithItemsRef = useRef(items.length > 0);
  const hasCompletedPostLoadAlignmentRef = useRef(false);
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
  const {
    activeIndex,
    activeItemId,
    commitActiveVideo,
    getRowRenderState,
    handleDoubleTap,
    handleHoldEnd,
    handleHoldStart,
    handleRowUnmount,
    handleSingleTap,
    registerActiveController,
  } = useFullscreenPlaybackSession({
    items,
    onActiveItemChange,
  });
  const viewabilityConfigRef = useRef({
    itemVisiblePercentThreshold: 80,
  });

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
    if (items.length === 0 || activeIndex !== null) {
      return;
    }

    const nextItem = items[initialPosition.targetIndex];
    if (!nextItem) {
      return;
    }

    commitActiveVideo(nextItem.videoId, initialPosition.targetIndex);
  }, [activeIndex, commitActiveVideo, initialPosition.targetIndex, items]);

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<FeedItem>[] }) => {
      const nextActiveVideo = resolveActiveVideoChange({
        currentActiveIndex: activeIndex,
        currentActiveItemId: activeItemId,
        viewableItems,
      });

      if (!nextActiveVideo) {
        return;
      }

      commitActiveVideo(nextActiveVideo.itemId, nextActiveVideo.index);
    },
    [activeIndex, activeItemId, commitActiveVideo]
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
      activeItemId,
      bottomInset: insets.bottom,
      getRowRenderState,
      height,
      width,
    }),
    [activeIndex, activeItemId, getRowRenderState, height, insets.bottom, width]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: FeedItem; index: number }) => {
      const rowRenderState = getRowRenderState(item.videoId, index);
      const isCurrentActiveItem = item.videoId === activeItemId;

      return (
        <FullscreenVideoRow
          accessibilityLabel={rowRenderState.accessibilityLabel}
          bottomInset={insets.bottom}
          height={height}
          hudState={rowRenderState.hudState}
          isActive={isCurrentActiveItem}
          onDoubleTap={handleDoubleTap}
          onHoldEnd={handleHoldEnd}
          onHoldStart={handleHoldStart}
          onRowUnmount={handleRowUnmount}
          onSingleTap={handleSingleTap}
          playbackRate={rowRenderState.effectivePlaybackState.playbackRate}
          registerActiveController={
            isCurrentActiveItem ? registerActiveController : undefined
          }
          shouldEnableBackgroundGestures={rowRenderState.shouldEnableBackgroundGestures}
          shouldUsePlayer={shouldMountPlayer(index, activeIndex ?? -1)}
          shouldPlay={rowRenderState.effectivePlaybackState.shouldPlay}
          video={item}
          width={width}
        />
      );
    },
    [
      activeIndex,
      activeItemId,
      getRowRenderState,
      handleDoubleTap,
      handleHoldEnd,
      handleHoldStart,
      handleRowUnmount,
      handleSingleTap,
      height,
      insets.bottom,
      registerActiveController,
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
    </View>
  );
}
