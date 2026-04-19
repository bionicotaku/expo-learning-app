import { memo } from 'react';
import { View } from 'react-native';

import { fullscreenVideoOverlayActionItems } from '../model/overlay-data';
import { VideoOverlayActionButton } from './video-overlay-action-button';

const noop = () => {};

type VideoOverlayActionRailProps = {
  bottomInset: number;
};

function VideoOverlayActionRailComponent({
  bottomInset,
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
          onPress={noop}
        />
      ))}
    </View>
  );
}

export const VideoOverlayActionRail = memo(VideoOverlayActionRailComponent);
