import { memo } from 'react';
import { View } from 'react-native';

import {
  fullscreenVideoOverlayActionItems,
  type FullscreenVideoOverlayActionItem,
} from '../model/overlay-data';
import { VideoOverlayActionButton } from './video-overlay-action-button';

type VideoOverlayActionRailProps = {
  bottomInset: number;
  onActionPress?: (item: FullscreenVideoOverlayActionItem) => void;
};

function VideoOverlayActionRailComponent({
  bottomInset,
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
          key={item.id}
          item={item}
          onPress={
            onActionPress
              ? () => {
                  onActionPress(item);
                }
              : undefined
          }
        />
      ))}
    </View>
  );
}

export const VideoOverlayActionRail = memo(VideoOverlayActionRailComponent);
