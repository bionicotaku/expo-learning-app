import { useEvent } from 'expo';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { FeedItem } from '@/entities/feed';
import { colors } from '@/shared/theme/colors';

type VideoFeedItemProps = {
  video: FeedItem;
  width: number;
  height: number;
  isActive: boolean;
  isMuted: boolean;
  onToggleMuted: () => void;
  shouldUsePlayer: boolean;
};

const buttonTextStyle = {
  color: colors.textPrimary,
  fontSize: 14,
  fontWeight: '700' as const,
};

export function VideoFeedItem({
  video,
  width,
  height,
  isActive,
  isMuted,
  onToggleMuted,
  shouldUsePlayer,
}: VideoFeedItemProps) {
  return (
    <Pressable
      onPress={onToggleMuted}
      style={{
        width,
        height,
        backgroundColor: colors.background,
      }}>
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
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 40,
          }}>
          <Text
            selectable
            style={{ color: colors.textSecondary, fontSize: 14, fontWeight: '600', textAlign: 'center' }}>
            {video.title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

type PlayableVideoSurfaceProps = {
  video: FeedItem;
  isActive: boolean;
  isMuted: boolean;
};

function PlayableVideoSurface({
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
            backgroundColor: colors.overlayStrong,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
          }}>
          <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '700' }}>
            Loading video...
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
            {video.title}
          </Text>
        </View>
      ) : null}

      {status === 'error' ? (
        <View
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: colors.overlayStrong,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 32,
            gap: 12,
          }}>
          <Text
            selectable
            style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '700', textAlign: 'center' }}>
            Video unavailable
          </Text>
          <Text
            selectable
            style={{ color: colors.textSecondary, fontSize: 14, textAlign: 'center' }}>
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
              backgroundColor: pressed ? 'rgba(255,255,255,0.22)' : colors.accentMuted,
            })}>
            <Text style={buttonTextStyle}>Retry</Text>
          </Pressable>
        </View>
      ) : null}
    </>
  );
}
