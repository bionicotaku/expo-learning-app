import { memo } from 'react';
import { Text, View } from 'react-native';

type PlaybackFeedbackOverlayProps = {
  audioToastLabel: string | null;
};

function PlaybackFeedbackOverlayComponent({
  audioToastLabel,
}: PlaybackFeedbackOverlayProps) {
  if (!audioToastLabel) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        inset: 0,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          paddingHorizontal: 18,
          paddingVertical: 12,
          borderRadius: 999,
          backgroundColor: 'rgba(0,0,0,0.68)',
        }}
      >
        <Text
          selectable
          style={{
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '800',
            textShadowColor: 'rgba(0,0,0,0.24)',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 2,
          }}
        >
          {audioToastLabel}
        </Text>
      </View>
    </View>
  );
}

export const PlaybackFeedbackOverlay = memo(PlaybackFeedbackOverlayComponent);
