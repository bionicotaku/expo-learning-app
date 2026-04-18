import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { ViewToken } from 'react-native';
import { FlatList, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { FeedListItem } from '@/entities/video';
import { isFeedVideoItem } from '@/entities/video';
import {
  buildFeedListItems,
  getDebugCounterLabel,
  usePaginatedFeed,
} from '@/features/feed-pagination';
import {
  createFeedPlaybackState,
  feedPlaybackReducer,
} from '@/features/video-playback';
import { colors } from '@/shared/theme/colors';

import { shouldMountPlayer } from '../model/player-window';
import { VideoFeedItem } from './video-feed-item';
import { VideoFeedLoadingCard } from './video-feed-loading-card';

const audioToastDurationMs = 700;

const appendingTitle = 'Loading next page...';
const appendingSubtitle = 'Simulated 3 second network delay';
const initialTitle = 'Loading first page...';
const initialSubtitle = 'Building the first 10 mock feed items';

export function VideoFeed() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const audioToastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { items, isInitialLoading, isAppending, loadMoreIfNeeded } = usePaginatedFeed();
  const [playbackState, dispatch] = useReducer(
    feedPlaybackReducer,
    undefined,
    createFeedPlaybackState
  );
  const [audioToastLabel, setAudioToastLabel] = useState<string | null>(null);
  const feedItems = useMemo(() => buildFeedListItems(items, isAppending), [items, isAppending]);

  useEffect(() => {
    return () => {
      if (audioToastTimeoutRef.current) {
        clearTimeout(audioToastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    const currentItem = feedItems[playbackState.activeIndex];

    if (!currentItem || currentItem.id === playbackState.activeItemId) {
      return;
    }

    dispatch({
      type: 'set-active-item',
      itemId: currentItem.id,
      index: playbackState.activeIndex,
    });
  }, [feedItems, items.length, playbackState.activeIndex, playbackState.activeItemId]);

  useEffect(() => {
    loadMoreIfNeeded(playbackState.activeIndex);
  }, [loadMoreIfNeeded, playbackState.activeIndex]);

  const viewabilityConfigRef = useRef({
    itemVisiblePercentThreshold: 80,
  });

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<FeedListItem>[] }) => {
      const currentItem = viewableItems.find((item) => item.isViewable && typeof item.index === 'number');

      if (currentItem?.item && typeof currentItem.index === 'number') {
        dispatch({
          type: 'set-active-item',
          itemId: currentItem.item.id,
          index: currentItem.index,
        });
      }
    }
  );

  const activeListItem = feedItems[playbackState.activeIndex];
  const activeVideo = activeListItem && isFeedVideoItem(activeListItem) ? activeListItem : null;

  const showAudioToast = (nextMutedValue: boolean) => {
    if (audioToastTimeoutRef.current) {
      clearTimeout(audioToastTimeoutRef.current);
    }

    setAudioToastLabel(nextMutedValue ? 'Muted' : 'Sound On');
    audioToastTimeoutRef.current = setTimeout(() => {
      setAudioToastLabel(null);
    }, audioToastDurationMs);
  };

  const handleToggleMuted = () => {
    const nextMutedValue = !playbackState.isMuted;
    dispatch({ type: 'toggle-muted' });
    showAudioToast(nextMutedValue);
  };

  if (isInitialLoading && items.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <VideoFeedLoadingCard
          width={width}
          height={height}
          title={initialTitle}
          subtitle={initialSubtitle}
        />
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: insets.top + 20,
            left: 18,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 999,
            backgroundColor: colors.overlay,
          }}>
          <Text
            selectable
            style={{
              color: colors.textPrimary,
              fontSize: 14,
              fontWeight: '700',
              fontVariant: ['tabular-nums'],
            }}>
            0 / 0
          </Text>
        </View>
      </View>
    );
  }

  const debugLabel = getDebugCounterLabel(playbackState.activeIndex, items.length);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={feedItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          if (!isFeedVideoItem(item)) {
            return (
              <VideoFeedLoadingCard
                width={width}
                height={height}
                title={appendingTitle}
                subtitle={appendingSubtitle}
              />
            );
          }

          return (
            <VideoFeedItem
              video={item}
              width={width}
              height={height}
              isActive={item.id === playbackState.activeItemId}
              isMuted={playbackState.isMuted}
              onToggleMuted={handleToggleMuted}
              shouldUsePlayer={shouldMountPlayer(index, playbackState.activeIndex)}
            />
          );
        }}
        pagingEnabled
        bounces={false}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        windowSize={5}
        initialNumToRender={3}
        maxToRenderPerBatch={4}
        getItemLayout={(_, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
        viewabilityConfig={viewabilityConfigRef.current}
        onViewableItemsChanged={onViewableItemsChanged.current}
      />

      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: insets.top + 20,
          left: 18,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 999,
          backgroundColor: colors.overlay,
        }}>
        <Text
          selectable
          style={{
            color: colors.textPrimary,
            fontSize: 14,
            fontWeight: '700',
            fontVariant: ['tabular-nums'],
          }}>
          {debugLabel}
        </Text>
      </View>

      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 18,
          right: 18,
          bottom: insets.bottom + 28,
          gap: 8,
        }}>
        <Text
          selectable
          style={{ color: colors.textPrimary, fontSize: 24, fontWeight: '800' }}>
          {activeVideo?.title ?? appendingTitle}
        </Text>
        <Text
          selectable
          style={{ color: colors.textSecondary, fontSize: 15, lineHeight: 20 }}>
          {activeVideo?.subtitle ?? appendingSubtitle}
        </Text>

        {activeVideo && playbackState.isMuted ? (
          <Text
            selectable
            style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '600' }}>
            Tap anywhere to unmute
          </Text>
        ) : null}
      </View>

      {audioToastLabel ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            inset: 0,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View
            style={{
              paddingHorizontal: 18,
              paddingVertical: 12,
              borderRadius: 999,
              backgroundColor: colors.overlayStrong,
            }}>
            <Text
              selectable
              style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '800' }}>
              {audioToastLabel}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}
