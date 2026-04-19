import { memo } from 'react';
import { Pressable, View } from 'react-native';

import type { FeedItem } from '@/entities/feed';
import {
  areFullscreenVideoItemRenderPropsEqual,
  type FullscreenVideoItemRenderProps,
} from '../model/render-props';
import { PlayableVideoSurface } from './playable-video-surface';
import { RowBoundVideoOverlay } from './row-bound-video-overlay';

type FullscreenVideoItemProps = {
  bottomInset: number;
  height: number;
  isActive: boolean;
  isMuted: boolean;
  onToggleMuted: () => void;
  shouldUsePlayer: boolean;
  video: FeedItem;
  width: number;
};

function FullscreenVideoItemComponent({
  video,
  width,
  height,
  bottomInset,
  isActive,
  isMuted,
  onToggleMuted,
  shouldUsePlayer,
}: FullscreenVideoItemProps) {
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
        <PlayableVideoSurface video={video} isActive={isActive} isMuted={isMuted} />
      ) : (
        <View
          style={{
            flex: 1,
            backgroundColor: '#000000',
          }}
        />
      )}

      <RowBoundVideoOverlay
        bottomInset={bottomInset}
        title={video.title}
        subtitle={video.subtitle}
      />
    </Pressable>
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
    isMuted: previousProps.isMuted,
    shouldUsePlayer: previousProps.shouldUsePlayer,
  };
  const nextRenderProps: FullscreenVideoItemRenderProps = {
    videoId: nextProps.video.id,
    width: nextProps.width,
    height: nextProps.height,
    isActive: nextProps.isActive,
    isMuted: nextProps.isMuted,
    shouldUsePlayer: nextProps.shouldUsePlayer,
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
