import { memo } from 'react';
import { View } from 'react-native';

import type { FeedItem } from '@/entities/feed';
import type {
  FullscreenHoldZone,
  FullscreenTapZone,
} from '@/features/video-playback';
import type { FullscreenVideoOverlayActionItem } from '../model/overlay-data';
import {
  areFullscreenVideoItemRenderPropsEqual,
  type FullscreenVideoItemRenderProps,
} from '../model/render-props';
import type { FullscreenActivePlayerController } from '../model/active-player-controller';
import { ActiveVideoGestureSurface } from './active-video-gesture-surface';
import { PlayableVideoSurface } from './playable-video-surface';
import { RowOwnedVideoOverlay } from './row-owned-video-overlay';

type FullscreenVideoItemProps = {
  accessibilityLabel: string;
  bottomInset: number;
  height: number;
  isActive: boolean;
  onActionPress?: (item: FullscreenVideoOverlayActionItem) => void;
  onDoubleTap: (zone: FullscreenTapZone) => void;
  onHoldEnd: () => void;
  onHoldStart: (zone: FullscreenHoldZone) => void;
  onSingleTap: () => void;
  playbackRate: number;
  registerActiveController?:
    | ((controller: FullscreenActivePlayerController | null) => void)
    | undefined;
  shouldEnableBackgroundGestures: boolean;
  shouldUsePlayer: boolean;
  shouldPlay: boolean;
  video: FeedItem;
  width: number;
};

function FullscreenVideoItemComponent({
  accessibilityLabel,
  video,
  width,
  height,
  bottomInset,
  onActionPress,
  onDoubleTap,
  onHoldEnd,
  onHoldStart,
  onSingleTap,
  playbackRate,
  registerActiveController,
  shouldEnableBackgroundGestures,
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
        <PlayableVideoSurface
          playbackRate={playbackRate}
          registerActiveController={registerActiveController}
          shouldPlay={shouldPlay}
          video={video}
        />
      ) : (
        <View
          style={{
            flex: 1,
            backgroundColor: '#000000',
          }}
        />
      )}

      {shouldEnableBackgroundGestures ? (
        <ActiveVideoGestureSurface
          accessibilityLabel={accessibilityLabel}
          onDoubleTap={onDoubleTap}
          onHoldEnd={onHoldEnd}
          onHoldStart={onHoldStart}
          onSingleTap={onSingleTap}
          width={width}
        />
      ) : null}

      <RowOwnedVideoOverlay
        bottomInset={bottomInset}
        description={video.description}
        onActionPress={onActionPress}
        title={video.title}
      />
    </View>
  );
}

function areFullscreenVideoItemComponentPropsEqual(
  previousProps: FullscreenVideoItemProps,
  nextProps: FullscreenVideoItemProps
): boolean {
  const previousRenderProps: FullscreenVideoItemRenderProps = {
    videoId: previousProps.video.videoId,
    width: previousProps.width,
    height: previousProps.height,
    isActive: previousProps.isActive,
    playbackRate: previousProps.playbackRate,
    shouldEnableBackgroundGestures: previousProps.shouldEnableBackgroundGestures,
    shouldUsePlayer: previousProps.shouldUsePlayer,
    shouldPlay: previousProps.shouldPlay,
  };
  const nextRenderProps: FullscreenVideoItemRenderProps = {
    videoId: nextProps.video.videoId,
    width: nextProps.width,
    height: nextProps.height,
    isActive: nextProps.isActive,
    playbackRate: nextProps.playbackRate,
    shouldEnableBackgroundGestures: nextProps.shouldEnableBackgroundGestures,
    shouldUsePlayer: nextProps.shouldUsePlayer,
    shouldPlay: nextProps.shouldPlay,
  };

  return (
    areFullscreenVideoItemRenderPropsEqual(previousRenderProps, nextRenderProps) &&
    previousProps.bottomInset === nextProps.bottomInset &&
    previousProps.video.videoUrl === nextProps.video.videoUrl &&
    previousProps.video.title === nextProps.video.title &&
    previousProps.video.description === nextProps.video.description
  );
}

export const FullscreenVideoItem = memo(
  FullscreenVideoItemComponent,
  areFullscreenVideoItemComponentPropsEqual
);
