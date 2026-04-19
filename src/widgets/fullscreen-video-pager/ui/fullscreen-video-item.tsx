import { memo } from 'react';
import { Pressable, View } from 'react-native';

import type { FeedItem } from '@/entities/feed';
import type { FullscreenVideoOverlayActionItem } from '../model/overlay-data';
import {
  areFullscreenVideoItemRenderPropsEqual,
  type FullscreenVideoItemRenderProps,
} from '../model/render-props';
import { PlayableVideoSurface } from './playable-video-surface';
import { RowOwnedVideoOverlay } from './row-owned-video-overlay';

type FullscreenVideoItemProps = {
  bottomInset: number;
  height: number;
  isActive: boolean;
  onActionPress?: (item: FullscreenVideoOverlayActionItem) => void;
  onTogglePlayback: () => void;
  shouldUsePlayer: boolean;
  shouldPlay: boolean;
  video: FeedItem;
  width: number;
};

function FullscreenVideoItemComponent({
  video,
  width,
  height,
  bottomInset,
  isActive,
  onActionPress,
  onTogglePlayback,
  shouldUsePlayer,
  shouldPlay,
}: FullscreenVideoItemProps) {
  return (
    <View
      style={{
        width,
        height,
        backgroundColor: '#000000',
      }}
    >
      {shouldUsePlayer ? (
        <PlayableVideoSurface video={video} shouldPlay={shouldPlay} />
      ) : (
        <View
          style={{
            flex: 1,
            backgroundColor: '#000000',
          }}
        />
      )}

      <Pressable
        accessibilityLabel={shouldPlay ? 'Pause video' : 'Play video'}
        accessibilityRole="button"
        disabled={!isActive}
        onPress={onTogglePlayback}
        style={{
          position: 'absolute',
          inset: 0,
        }}
      />

      <RowOwnedVideoOverlay
        bottomInset={bottomInset}
        onActionPress={onActionPress}
        title={video.title}
        subtitle={video.subtitle}
      />
    </View>
  );
}

function areFullscreenVideoItemComponentPropsEqual(
  previousProps: FullscreenVideoItemProps,
  nextProps: FullscreenVideoItemProps
): boolean {
  const previousRenderProps: FullscreenVideoItemRenderProps = {
    videoId: previousProps.video.id,
    width: previousProps.width,
    height: previousProps.height,
    isActive: previousProps.isActive,
    shouldUsePlayer: previousProps.shouldUsePlayer,
    shouldPlay: previousProps.shouldPlay,
  };
  const nextRenderProps: FullscreenVideoItemRenderProps = {
    videoId: nextProps.video.id,
    width: nextProps.width,
    height: nextProps.height,
    isActive: nextProps.isActive,
    shouldUsePlayer: nextProps.shouldUsePlayer,
    shouldPlay: nextProps.shouldPlay,
  };

  return (
    areFullscreenVideoItemRenderPropsEqual(previousRenderProps, nextRenderProps) &&
    previousProps.bottomInset === nextProps.bottomInset &&
    previousProps.video.uri === nextProps.video.uri &&
    previousProps.video.title === nextProps.video.title &&
    previousProps.video.subtitle === nextProps.video.subtitle
  );
}

export const FullscreenVideoItem = memo(
  FullscreenVideoItemComponent,
  areFullscreenVideoItemComponentPropsEqual
);
