import { Text, View } from 'react-native';

import type { FullscreenVideoOverlayActionItem } from '../model/overlay-data';
import { VideoOverlayActionRail } from './video-overlay-action-rail';

type RowOwnedVideoOverlayProps = {
  bottomInset: number;
  onActionPress?: (item: FullscreenVideoOverlayActionItem) => void;
  title: string;
  subtitle: string;
};

export function RowOwnedVideoOverlay({
  bottomInset,
  onActionPress,
  title,
  subtitle,
}: RowOwnedVideoOverlayProps) {
  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        inset: 0,
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          inset: 0,
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: bottomInset + 182,
            experimental_backgroundImage:
              'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 42%, rgba(0,0,0,0.22) 74%, rgba(0,0,0,0.34) 100%)',
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: 22,
            right: 92,
            bottom: bottomInset + 40,
          }}
        >
          <Text
            selectable
            style={{
              fontSize: 15,
              lineHeight: 22,
              letterSpacing: -0.08,
              fontWeight: '700',
              color: 'rgba(251,247,238,0.97)',
              textShadowColor: 'rgba(17,13,10,0.26)',
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 3,
              maxWidth: 260,
              marginBottom: 12,
            }}
            numberOfLines={2}
          >
            {title}
          </Text>
          <Text
            selectable
            style={{
              fontSize: 13.5,
              lineHeight: 21,
              color: 'rgba(251,247,238,0.9)',
              textShadowColor: 'rgba(17,13,10,0.24)',
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 3,
              maxWidth: 248,
            }}
          >
            {subtitle}
          </Text>
        </View>
      </View>

      <VideoOverlayActionRail
        bottomInset={bottomInset}
        onActionPress={onActionPress}
      />
    </View>
  );
}
