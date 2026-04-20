import { MaterialIcons } from '@expo/vector-icons';
import { SymbolView } from 'expo-symbols';
import { memo } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { AdaptiveGlass } from '@/shared/ui/editorial-paper';

import { type FullscreenPlaybackFeedback } from '../model/playback-feedback';

type PlaybackFeedbackOverlayProps = {
  playbackFeedback: FullscreenPlaybackFeedback | null;
};

const iconTint = 'rgba(251,247,238,0.96)';
const seekGlassShadow =
  '6px 9px 18px rgba(17,13,10,0.16), inset 0 1px 1px rgba(255,255,255,0.22), inset 0 -2px 5px rgba(17,13,10,0.08)';
const rateGlassShadow =
  '7px 10px 18px rgba(17,13,10,0.16), inset 0 1px 1px rgba(255,255,255,0.22), inset 0 -2px 5px rgba(17,13,10,0.08)';
const hudFadeIn = FadeIn.duration(180);
const hudFadeOut = FadeOut.duration(140);

type FullscreenHudSymbolProps = {
  fallbackGlyph?: string;
  fallbackIconName?: keyof typeof MaterialIcons.glyphMap;
  iosSymbol: 'backward.fill' | 'forward.fill' | 'speedometer';
  size: number;
};

function FullscreenHudSymbol({
  fallbackGlyph,
  fallbackIconName,
  iosSymbol,
  size,
}: FullscreenHudSymbolProps) {
  return (
    <SymbolView
      fallback={
        fallbackIconName ? (
          <MaterialIcons color={iconTint} name={fallbackIconName} size={size} />
        ) : (
          <Text
            style={{
              color: iconTint,
              fontSize: size,
              lineHeight: size,
              fontWeight: '800',
              textShadowColor: 'rgba(17,13,10,0.22)',
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 2,
            }}
          >
            {fallbackGlyph}
          </Text>
        )
      }
      name={{ ios: iosSymbol }}
      size={size}
      tintColor={iconTint}
      type="hierarchical"
      weight="semibold"
    />
  );
}

function PlaybackFeedbackOverlayComponent({
  playbackFeedback,
}: PlaybackFeedbackOverlayProps) {
  if (!playbackFeedback) {
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
      {playbackFeedback.kind === 'seek' ? (
        <Animated.View
          key={`seek-${playbackFeedback.deltaSeconds}`}
          entering={hudFadeIn}
          exiting={hudFadeOut}
          style={{
            transform: [
              { translateX: playbackFeedback.deltaSeconds < 0 ? -122 : 122 },
            ],
          }}
        >
          <AdaptiveGlass
            appearance="clear"
            radius={29}
            style={{
              width: 58,
              height: 58,
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: seekGlassShadow,
            }}
            variant="pill"
          >
            <FullscreenHudSymbol
              fallbackIconName={
                playbackFeedback.deltaSeconds < 0 ? 'fast-rewind' : 'fast-forward'
              }
              iosSymbol={
                playbackFeedback.deltaSeconds < 0 ? 'backward.fill' : 'forward.fill'
              }
              size={24}
            />
          </AdaptiveGlass>
        </Animated.View>
      ) : (
        <Animated.View
          key="rate"
          entering={hudFadeIn}
          exiting={hudFadeOut}
          style={{
            position: 'absolute',
            top: '15%',
            alignSelf: 'center',
          }}
        >
          <AdaptiveGlass
            appearance="clear"
            radius={999}
            style={{
              minWidth: 82,
              minHeight: 40,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: rateGlassShadow,
            }}
            variant="pill"
          >
            <FullscreenHudSymbol
              fallbackIconName="speed"
              iosSymbol="speedometer"
              size={24}
            />
            <Text
              selectable
              style={{
                color: iconTint,
                fontSize: 17,
                fontWeight: '800',
                textShadowColor: 'rgba(17,13,10,0.2)',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 2,
              }}
            >
              2x
            </Text>
          </AdaptiveGlass>
        </Animated.View>
      )}
    </View>
  );
}

export const PlaybackFeedbackOverlay = memo(PlaybackFeedbackOverlayComponent);
