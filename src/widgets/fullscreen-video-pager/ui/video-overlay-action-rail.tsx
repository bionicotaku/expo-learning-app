import { memo } from 'react';
import { View } from 'react-native';

import {
  fullscreenVideoOverlayActionItems,
  type FullscreenVideoOverlayActionItem,
} from '../model/overlay-data';
import { VideoOverlayActionButton } from './video-overlay-action-button';

type VideoOverlayActionRailProps = {
  areSubtitlesVisible: boolean;
  bottomInset: number;
  isFavorited: boolean;
  isLiked: boolean;
  onActionPress?: (item: FullscreenVideoOverlayActionItem) => void;
};

const likeTint = 'rgba(255,108,108,0.98)';
const favoriteTint = 'rgba(255,216,102,0.98)';
const subtitleTint = 'rgba(142,211,255,0.98)';

function VideoOverlayActionRailComponent({
  areSubtitlesVisible,
  bottomInset,
  isFavorited,
  isLiked,
  onActionPress,
}: VideoOverlayActionRailProps) {
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
                  ? subtitleTint
                  : undefined
          }
          isActive={
            item.id === 'like'
              ? isLiked
              : item.id === 'favorite'
                ? isFavorited
                : item.id === 'subtitle'
                  ? areSubtitlesVisible
                  : false
          }
          key={item.id}
          item={item}
          onPress={onActionPress}
        />
      ))}
    </View>
  );
}

export const VideoOverlayActionRail = memo(VideoOverlayActionRailComponent);
