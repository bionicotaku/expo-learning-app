import { useEvent } from 'expo';
import { VideoView, useVideoPlayer } from 'expo-video';
import { memo, useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { FeedItem } from '@/entities/feed';
import {
  arePlayableVideoSurfacePropsEqual,
  type PlayableVideoSurfaceRenderProps,
} from '../model/render-props';

type PlayableVideoSurfaceProps = {
  isActive: boolean;
  isMuted: boolean;
  video: FeedItem;
};

function PlayableVideoSurfaceComponent({
  video,
  isActive,
  isMuted,
}: PlayableVideoSurfaceProps) {
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

function arePlayableVideoSurfaceComponentPropsEqual(
  previousProps: PlayableVideoSurfaceProps,
  nextProps: PlayableVideoSurfaceProps
): boolean {
  const previousRenderProps: PlayableVideoSurfaceRenderProps = {
    videoId: previousProps.video.id,
    isActive: previousProps.isActive,
    isMuted: previousProps.isMuted,
  };
  const nextRenderProps: PlayableVideoSurfaceRenderProps = {
    videoId: nextProps.video.id,
    isActive: nextProps.isActive,
    isMuted: nextProps.isMuted,
  };

  return (
    arePlayableVideoSurfacePropsEqual(previousRenderProps, nextRenderProps) &&
    previousProps.video.uri === nextProps.video.uri
  );
}

export const PlayableVideoSurface = memo(
  PlayableVideoSurfaceComponent,
  arePlayableVideoSurfaceComponentPropsEqual
);
