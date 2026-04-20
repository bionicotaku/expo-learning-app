import { memo, useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';

import type { FeedItem } from '@/entities/feed';

import type { FullscreenActivePlayerController } from '../model/active-player-controller';
import type {
  FullscreenRowSeekController,
  RowPlaybackSeekBarStore,
} from '../model/row-playback-seek-bar-store';
import type { FullscreenRowSurfacePresentation } from '../model/row-surface-presentation';
import { PlayableVideoSurface } from './playable-video-surface';

type RowPlaybackMediaLayerProps = {
  isActive: boolean;
  onSurfacePresentationChange: (presentation: FullscreenRowSurfacePresentation | null) => void;
  playbackRate: number;
  registerActiveController?:
    | ((controller: FullscreenActivePlayerController | null) => void)
    | undefined;
  seekBarStore: RowPlaybackSeekBarStore;
  shouldPlay: boolean;
  shouldUsePlayer: boolean;
  video: FeedItem;
};

function RowPlaybackMediaLayerComponent({
  isActive,
  onSurfacePresentationChange,
  playbackRate,
  registerActiveController,
  seekBarStore,
  shouldPlay,
  shouldUsePlayer,
  video,
}: RowPlaybackMediaLayerProps) {
  const [surfacePresentation, setSurfacePresentation] =
    useState<FullscreenRowSurfacePresentation | null>(null);
  const resetLiveMediaLayerState = useCallback(() => {
    setSurfacePresentation(null);
    seekBarStore.clear();
  }, [seekBarStore]);
  const setProgressSnapshot = useCallback(
    (snapshot: ReturnType<RowPlaybackSeekBarStore['getSnapshot']>['progressSnapshot']) => {
      seekBarStore.setProgressSnapshot(snapshot);
    },
    [seekBarStore]
  );
  const setSeekController = useCallback(
    (controller: FullscreenRowSeekController | null) => {
      seekBarStore.setSeekController(controller);
    },
    [seekBarStore]
  );

  useEffect(() => {
    onSurfacePresentationChange(surfacePresentation);
  }, [onSurfacePresentationChange, surfacePresentation]);

  useEffect(() => {
    return () => {
      onSurfacePresentationChange(null);
    };
  }, [onSurfacePresentationChange]);

  useEffect(() => {
    if (isActive && shouldUsePlayer) {
      return;
    }

    resetLiveMediaLayerState();
  }, [isActive, resetLiveMediaLayerState, shouldUsePlayer]);

  useEffect(() => {
    return () => {
      seekBarStore.clear();
    };
  }, [seekBarStore]);

  return (
    <>
      {shouldUsePlayer ? (
        <PlayableVideoSurface
          onActiveProgressSnapshotChange={isActive ? setProgressSnapshot : undefined}
          onSurfacePresentationChange={isActive ? setSurfacePresentation : undefined}
          playbackRate={playbackRate}
          registerActiveController={registerActiveController}
          registerSeekController={isActive ? setSeekController : undefined}
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
    </>
  );
}

export const RowPlaybackMediaLayer = memo(RowPlaybackMediaLayerComponent);
