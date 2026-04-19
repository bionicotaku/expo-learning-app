import { useEvent } from 'expo';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import type { FlatList as FlatListType, ViewToken } from 'react-native';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { FeedItem } from '@/entities/feed';
import { shouldMountPlayer } from '@/features/video-playback';
import { getFullscreenVideoLoadingState } from '../model/loading-state';

const audioToastDurationMs = 700;

type FullscreenVideoPagerProps = {
  activeIndex: number | null;
  activeItemId: string | null;
  targetIndex: number;
  isFetchingNextPage: boolean;
  isInitialLoading: boolean;
  isMuted: boolean;
  items: FeedItem[];
  onSetActiveItem: (itemId: string, index: number) => void;
  onToggleMuted: () => void;
};

export function FullscreenVideoPager({
  activeIndex,
  activeItemId,
  targetIndex,
  isFetchingNextPage,
  isInitialLoading,
  isMuted,
  items,
  onSetActiveItem,
  onToggleMuted,
}: FullscreenVideoPagerProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatListType<FeedItem>>(null);
  const audioToastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasAlignedInitialIndexRef = useRef(false);
  const [audioToastLabel, setAudioToastLabel] = useState<string | null>(null);
  const loadingState = getFullscreenVideoLoadingState({
    itemCount: items.length,
    isFetchingNextPage,
    isInitialLoading,
  });
  const activeItem = activeIndex === null ? null : (items[activeIndex] ?? null);
  const viewabilityConfigRef = useRef({
    itemVisiblePercentThreshold: 80,
  });
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<FeedItem>[] }) => {
      const currentItem = viewableItems.find(
        (item) => item.isViewable && typeof item.index === 'number'
      );

      if (!currentItem?.item || typeof currentItem.index !== 'number') {
        return;
      }

      onSetActiveItem(currentItem.item.id, currentItem.index);
    }
  );

  useEffect(() => {
    return () => {
      if (audioToastTimeoutRef.current) {
        clearTimeout(audioToastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (items.length === 0 || hasAlignedInitialIndexRef.current) {
      return;
    }

    const nextIndex = Math.max(0, Math.min(targetIndex, items.length - 1));
    const timer = setTimeout(() => {
      listRef.current?.scrollToIndex({
        animated: false,
        index: nextIndex,
      });
      hasAlignedInitialIndexRef.current = true;
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [items.length, targetIndex]);

  const handleToggleMuted = () => {
    const nextMutedValue = !isMuted;
    onToggleMuted();

    if (audioToastTimeoutRef.current) {
      clearTimeout(audioToastTimeoutRef.current);
    }

    setAudioToastLabel(nextMutedValue ? 'Muted' : 'Sound On');
    audioToastTimeoutRef.current = setTimeout(() => {
      setAudioToastLabel(null);
    }, audioToastDurationMs);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <FlatList
        ref={listRef}
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          return (
            <FullscreenVideoItem
              height={height}
              isActive={item.id === activeItemId}
              isMuted={isMuted}
              onToggleMuted={handleToggleMuted}
              shouldUsePlayer={shouldMountPlayer(index, activeIndex ?? -1)}
              video={item}
              width={width}
            />
          );
        }}
        // Fullscreen paging relies on exact viewport-sized items. Automatic
        // content insets shift the initial offset and break first-entry snap.
        bounces={false}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
        initialNumToRender={3}
        initialScrollIndex={
          items.length > 0 ? Math.max(0, Math.min(targetIndex, items.length - 1)) : undefined
        }
        maxToRenderPerBatch={4}
        pagingEnabled
        onScrollToIndexFailed={({ index }) => {
          setTimeout(() => {
            listRef.current?.scrollToIndex({
              animated: false,
              index,
            });
          }, 60);
        }}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
        viewabilityConfig={viewabilityConfigRef.current}
        windowSize={5}
        onViewableItemsChanged={onViewableItemsChanged.current}
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

      {activeItem && activeIndex !== null ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: insets.top + 20,
            left: 18,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 999,
            backgroundColor: 'rgba(0,0,0,0.42)',
          }}
        >
          <Text
            selectable
            style={{
              color: '#FFFFFF',
              fontSize: 14,
              fontVariant: ['tabular-nums'],
              fontWeight: '700',
            }}
          >
            {`${activeIndex + 1} / ${items.length}`}
          </Text>
        </View>
      ) : null}

      {activeItem ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 18,
            right: 18,
            bottom: insets.bottom + 28,
            gap: 8,
          }}
        >
          <Text selectable style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '800' }}>
            {activeItem.title}
          </Text>
          <Text
            selectable
            style={{
              color: 'rgba(255,255,255,0.74)',
              fontSize: 15,
              lineHeight: 20,
              fontWeight: '500',
            }}
          >
            {activeItem.subtitle}
          </Text>
        </View>
      ) : null}

      {audioToastLabel ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            inset: 0,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              paddingHorizontal: 18,
              paddingVertical: 12,
              borderRadius: 999,
              backgroundColor: 'rgba(0,0,0,0.68)',
            }}
          >
            <Text selectable style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '800' }}>
              {audioToastLabel}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function FullscreenVideoItem({
  video,
  width,
  height,
  isActive,
  isMuted,
  onToggleMuted,
  shouldUsePlayer,
}: {
  video: FeedItem;
  width: number;
  height: number;
  isActive: boolean;
  isMuted: boolean;
  onToggleMuted: () => void;
  shouldUsePlayer: boolean;
}) {
  return (
    <Pressable
      onPress={onToggleMuted}
      style={{
        width,
        height,
        backgroundColor: '#000000',
      }}
    >
      {shouldUsePlayer ? (
        <PlayableVideoSurface
          video={video}
          isActive={isActive}
          isMuted={isMuted}
        />
      ) : (
        <View
          style={{
            flex: 1,
            backgroundColor: '#000000',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 40,
          }}
        >
          <Text
            selectable
            style={{
              color: 'rgba(255,255,255,0.72)',
              fontSize: 14,
              fontWeight: '600',
              textAlign: 'center',
            }}
          >
            {video.title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

function PlayableVideoSurface({
  video,
  isActive,
  isMuted,
}: {
  video: FeedItem;
  isActive: boolean;
  isMuted: boolean;
}) {
  const player = useVideoPlayer(video.uri, (instance) => {
    instance.loop = true;
    instance.muted = isMuted;
  });

  const { status, error } = useEvent(player, 'statusChange', {
    status: player.status,
    error: undefined,
  });

  useEffect(() => {
    player.muted = isMuted;
  }, [isMuted, player]);

  useEffect(() => {
    if (!isActive) {
      player.pause();
      return;
    }

    if (status === 'readyToPlay') {
      player.play();
    }
  }, [isActive, player, status]);

  const handleRetry = async () => {
    await player.replaceAsync(video.uri);
    player.muted = isMuted;

    if (isActive) {
      player.play();
    }
  };

  return (
    <>
      <VideoView
        player={player}
        nativeControls={false}
        contentFit="cover"
        style={{ width: '100%', height: '100%' }}
      />

      {status !== 'readyToPlay' && status !== 'error' ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.68)',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Text selectable style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
            Loading video...
          </Text>
          <Text selectable style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13 }}>
            {video.title}
          </Text>
        </View>
      ) : null}

      {status === 'error' ? (
        <View
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.78)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 32,
            gap: 12,
          }}
        >
          <Text
            selectable
            style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700', textAlign: 'center' }}
          >
            Video unavailable
          </Text>
          <Text
            selectable
            style={{
              color: 'rgba(255,255,255,0.74)',
              fontSize: 14,
              textAlign: 'center',
            }}
          >
            {error?.message ?? 'The player could not load this video.'}
          </Text>
          <Pressable
            onPress={() => {
              void handleRetry();
            }}
            style={({ pressed }) => ({
              paddingHorizontal: 18,
              paddingVertical: 12,
              borderRadius: 999,
              backgroundColor: pressed ? 'rgba(255,255,255,0.24)' : 'rgba(255,255,255,0.18)',
            })}
          >
            <Text selectable style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
              Retry
            </Text>
          </Pressable>
        </View>
      ) : null}
    </>
  );
}
