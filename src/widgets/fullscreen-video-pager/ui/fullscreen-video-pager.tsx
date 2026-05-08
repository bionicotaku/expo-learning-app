import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { FlatList as FlatListType } from 'react-native';
import {
  ActivityIndicator,
  FlatList,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Transcript } from '@/entities/transcript';
import type { VideoListItem } from '@/entities/video';
import type { VideoMeta } from '@/entities/video-meta';
import type { SubtitleDisplayMode } from '@/features/playback-settings';
import { shouldMountPlayer, type FullscreenHoldZone } from '@/features/video-playback';
import { createExpandableOverlayDescriptionMeasurementCache } from '../model/expandable-overlay-description';
import { resolveInitialFullscreenPagerPosition } from '../model/initial-positioning';
import { getFullscreenVideoLoadingState } from '../model/loading-state';
import { useFullscreenPlaybackSession } from '../model/use-fullscreen-playback-session';
import { FullscreenVideoRow } from './fullscreen-video-row';
import { TopChromeOverlay } from './top-chrome-overlay';

export type FullscreenVideoPagerProps = {
  activeTranscript: Transcript | null;
  entryIndex: number;
  isInitialLoading: boolean;
  items: VideoListItem[];
  onActiveVideoChange: (itemId: string, index: number) => void;
  onCenterHoldStart?: () => void;
  subtitleDisplayMode: SubtitleDisplayMode;
  videoMetaByVideoId: ReadonlyMap<string, VideoMeta>;
};

export function FullscreenVideoPager({
  activeTranscript,
  entryIndex,
  isInitialLoading,
  items,
  onActiveVideoChange,
  onCenterHoldStart,
  subtitleDisplayMode,
  videoMetaByVideoId,
}: FullscreenVideoPagerProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatListType<VideoListItem>>(null);
  const descriptionMeasurementCacheRef = useRef(
    createExpandableOverlayDescriptionMeasurementCache()
  );
  const mountedWithItemsRef = useRef(items.length > 0);
  const hasCompletedPostLoadAlignmentRef = useRef(false);
  const loadingState = getFullscreenVideoLoadingState({
    itemCount: items.length,
    isInitialLoading,
  });
  const initialPosition = useMemo(
    () =>
      resolveInitialFullscreenPagerPosition({
        entryIndex,
        itemCount: items.length,
        mountedWithItems: mountedWithItemsRef.current,
        hasCompletedPostLoadAlignment: hasCompletedPostLoadAlignmentRef.current,
      }),
    [entryIndex, items.length]
  );
  const {
    activeIndex,
    activeItemId,
    acquirePlaybackHold,
    commitActiveVideo,
    getRowRenderState,
    handleDoubleTap,
    handleHoldEnd,
    handleHoldStart,
    handleRowUnmount,
    handleSingleTap,
    handleViewableItemsChanged,
    registerActiveController,
  } = useFullscreenPlaybackSession({
    activeTranscript,
    items,
    onActiveVideoChange,
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

  const handleScrollToIndexFailed = useCallback(({ index }: { index: number }) => {
    setTimeout(() => {
      listRef.current?.scrollToIndex({
        animated: false,
        index,
      });
    }, 60);
  }, []);

  const handleRowHoldStart = useCallback(
    (zone: FullscreenHoldZone) => {
      if (zone === 'center') {
        onCenterHoldStart?.();
      }

      handleHoldStart(zone);
    },
    [handleHoldStart, onCenterHoldStart]
  );

  const renderState = useMemo(
    () => ({
      activeIndex,
      activeItemId,
      activeTranscript,
      bottomInset: insets.bottom,
      getRowRenderState,
      height,
      subtitleDisplayMode,
      videoMetaByVideoId,
      width,
    }),
    [
      activeIndex,
      activeItemId,
      activeTranscript,
      getRowRenderState,
      height,
      insets.bottom,
      subtitleDisplayMode,
      videoMetaByVideoId,
      width,
    ]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: VideoListItem; index: number }) => {
      const rowRenderState = getRowRenderState(item.videoId, index);
      const isCurrentActiveItem = item.videoId === activeItemId;

      return (
        <FullscreenVideoRow
          accessibilityLabel={rowRenderState.accessibilityLabel}
          acquirePlaybackHold={isCurrentActiveItem ? acquirePlaybackHold : undefined}
          activeTranscript={isCurrentActiveItem ? activeTranscript : null}
          activeVisitToken={rowRenderState.activeVisitToken}
          bottomInset={insets.bottom}
          height={height}
          hudState={rowRenderState.hudState}
          isActive={isCurrentActiveItem}
          measurementCache={descriptionMeasurementCacheRef.current}
          onDoubleTap={handleDoubleTap}
          onHoldEnd={handleHoldEnd}
          onHoldStart={handleRowHoldStart}
          onRowUnmount={handleRowUnmount}
          onSingleTap={handleSingleTap}
          playbackRate={rowRenderState.effectivePlaybackState.playbackRate}
          registerActiveController={
            isCurrentActiveItem ? registerActiveController : undefined
          }
          shouldEnableBackgroundGestures={rowRenderState.shouldEnableBackgroundGestures}
          shouldUsePlayer={shouldMountPlayer(index, activeIndex ?? -1)}
          shouldPlay={rowRenderState.effectivePlaybackState.shouldPlay}
          subtitleDisplayMode={subtitleDisplayMode}
          video={item}
          videoMeta={videoMetaByVideoId.get(item.videoId) ?? null}
          width={width}
        />
      );
    },
    [
      activeIndex,
      activeItemId,
      acquirePlaybackHold,
      activeTranscript,
      getRowRenderState,
      handleDoubleTap,
      handleHoldEnd,
      handleRowHoldStart,
      handleRowUnmount,
      handleSingleTap,
      height,
      insets.bottom,
      registerActiveController,
      subtitleDisplayMode,
      videoMetaByVideoId,
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
