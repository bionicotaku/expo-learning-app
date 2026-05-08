import { memo } from 'react';
import { View } from 'react-native';

import { formatEngagementCount } from '@/features/video-engagement';
import type { SubtitleDisplayMode } from '@/features/playback-settings';
import {
  fullscreenVideoOverlayActionItems,
  type FullscreenVideoOverlayActionItem,
} from '../model/overlay-data';
import { VideoOverlayActionButton } from './video-overlay-action-button';

type VideoOverlayActionRailProps = {
  bottomInset: number;
  favoriteCount: number;
  isFavoriteActionDisabled: boolean;
  isLikeActionDisabled: boolean;
  isFavorited: boolean;
  isLiked: boolean;
  likeCount: number;
  onActionPress?: (item: FullscreenVideoOverlayActionItem) => void;
  subtitleDisplayMode: SubtitleDisplayMode;
};

const likeTint = 'rgba(255,108,108,0.98)';
const favoriteTint = 'rgba(255,216,102,0.98)';
const subtitleTint = 'rgba(142,211,255,0.98)';
const iconTint = 'rgba(251,247,238,0.96)';

function getSubtitleActionPresentation(subtitleDisplayMode: SubtitleDisplayMode) {
  return {
    activeTintColor: subtitleTint,
    iosSymbol:
      subtitleDisplayMode === 'off'
        ? ('text.bubble' as const)
        : ('text.bubble.fill' as const),
    isActive: subtitleDisplayMode !== 'off',
    tintColor: subtitleDisplayMode === 'bilingual' ? subtitleTint : iconTint,
  };
}

function getEngagementActionCountLabel(
  item: FullscreenVideoOverlayActionItem,
  likeCount: number,
  favoriteCount: number
) {
  if (item.id === 'like') {
    return formatEngagementCount(likeCount);
  }

  if (item.id === 'favorite') {
    return formatEngagementCount(favoriteCount);
  }

  return undefined;
}

function VideoOverlayActionRailComponent({
  bottomInset,
  favoriteCount,
  isFavoriteActionDisabled,
  isLikeActionDisabled,
  isFavorited,
  isLiked,
  likeCount,
  onActionPress,
  subtitleDisplayMode,
}: VideoOverlayActionRailProps) {
  const subtitleActionPresentation = getSubtitleActionPresentation(subtitleDisplayMode);

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        right: 18,
        bottom: bottomInset + 112,
        alignItems: 'center',
        gap: 18,
      }}
    >
      {fullscreenVideoOverlayActionItems.map((item) => (
        <VideoOverlayActionButton
          activeTintColor={
            item.id === 'like'
              ? likeTint
              : item.id === 'favorite'
                ? favoriteTint
                : item.id === 'subtitle'
                  ? subtitleActionPresentation.activeTintColor
                  : undefined
          }
          iosSymbol={
            item.id === 'subtitle'
              ? subtitleActionPresentation.iosSymbol
              : undefined
          }
          isActive={
            item.id === 'like'
              ? isLiked
              : item.id === 'favorite'
                ? isFavorited
                : item.id === 'subtitle'
                  ? subtitleActionPresentation.isActive
                  : false
          }
          countLabel={getEngagementActionCountLabel(item, likeCount, favoriteCount)}
          key={item.id}
          item={item}
          disabled={
            item.id === 'like'
              ? isLikeActionDisabled
              : item.id === 'favorite'
                ? isFavoriteActionDisabled
                : false
          }
          onPress={onActionPress}
          tintColor={
            item.id === 'subtitle'
              ? subtitleActionPresentation.tintColor
              : undefined
          }
        />
      ))}
    </View>
  );
}

export const VideoOverlayActionRail = memo(VideoOverlayActionRailComponent);
