import { SymbolView } from 'expo-symbols';
import { memo } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { AdaptiveGlass } from '@/shared/ui/editorial-paper';

type PausedPlaybackIndicatorOverlayProps = {
  isVisible: boolean;
};

const iconTint = 'rgba(251,247,238,0.96)';
const glassShadow =
  '8px 12px 22px rgba(17,13,10,0.18), inset 0 1px 1px rgba(255,255,255,0.22), inset 0 -2px 5px rgba(17,13,10,0.1)';
const hudFadeIn = FadeIn.duration(180);
const hudFadeOut = FadeOut.duration(140);

function PausedPlaybackIndicatorOverlayComponent({
  isVisible,
}: PausedPlaybackIndicatorOverlayProps) {
  if (!isVisible) {
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
      <Animated.View entering={hudFadeIn} exiting={hudFadeOut}>
        <AdaptiveGlass
          appearance="clear"
          radius={34}
          style={{
            width: 68,
            height: 68,
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: glassShadow,
          }}
          variant="pill"
        >
          <SymbolView
            fallback={
              <Text
                style={{
                  color: iconTint,
                  fontSize: 32,
                  lineHeight: 32,
                  fontWeight: '800',
                  letterSpacing: -1,
                  textShadowColor: 'rgba(17,13,10,0.22)',
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 2,
                }}
              >
                ▶
              </Text>
            }
            name={{ ios: 'play.fill' }}
            size={30}
            tintColor={iconTint}
            type="hierarchical"
            weight="semibold"
          />
        </AdaptiveGlass>
      </Animated.View>
    </View>
  );
}

export const PausedPlaybackIndicatorOverlay = memo(
  PausedPlaybackIndicatorOverlayComponent
);
