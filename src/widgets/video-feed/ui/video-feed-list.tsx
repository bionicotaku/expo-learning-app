import { useRef } from 'react';
import type { ViewToken } from 'react-native';
import { FlatList } from 'react-native';

import { shouldMountPlayer } from '@/features/video-playback';

import type { VideoFeedRenderItem } from '../model/types';
import { isFeedLoadingTailItem } from '../model/types';
import { VideoFeedItem } from './video-feed-item';
import { VideoFeedLoadingCard } from './video-feed-loading-card';

type VideoFeedListProps = {
  activeIndex: number;
  activeItemId: string | null;
  height: number;
  isMuted: boolean;
  items: VideoFeedRenderItem[];
  onToggleMuted: () => void;
  onViewableItemChange: (itemId: string, index: number) => void;
  width: number;
};

export function VideoFeedList({
  activeIndex,
  activeItemId,
  height,
  isMuted,
  items,
  onToggleMuted,
  onViewableItemChange,
  width,
}: VideoFeedListProps) {
  const viewabilityConfigRef = useRef({
    itemVisiblePercentThreshold: 80,
  });

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<VideoFeedRenderItem>[] }) => {
      const currentItem = viewableItems.find(
        (item) => item.isViewable && typeof item.index === 'number'
      );

      if (!currentItem?.item || typeof currentItem.index !== 'number') {
        return;
      }

      onViewableItemChange(currentItem.item.id, currentItem.index);
    }
  );

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => {
        if (isFeedLoadingTailItem(item)) {
          return (
            <VideoFeedLoadingCard
              width={width}
              height={height}
              title="Loading next page..."
              subtitle="Simulated 3 second network delay"
            />
          );
        }

        return (
          <VideoFeedItem
            video={item}
            width={width}
            height={height}
            isActive={item.id === activeItemId}
            isMuted={isMuted}
            onToggleMuted={onToggleMuted}
            shouldUsePlayer={shouldMountPlayer(index, activeIndex)}
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
  );
}
