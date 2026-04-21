import { MaterialIcons } from '@expo/vector-icons';
import { SymbolView } from 'expo-symbols';
import { memo } from 'react';
import { Text } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { AdaptiveGlass } from '@/shared/ui/editorial-paper';

import { rowHudFadeOutDurationMs } from '../model/row-hud-layout';
import type { FullscreenRowPlaybackHudState } from '../model/row-playback-hud-state';
import { RowHudAnchors } from './row-hud-anchors';

type RowPlaybackHudOverlayProps = {
  hudState: FullscreenRowPlaybackHudState;
  showCenteredPause: boolean;
};

const iconTint = 'rgba(251,247,238,0.96)';
const pauseGlassShadow =
  '8px 12px 22px rgba(17,13,10,0.18), inset 0 1px 1px rgba(255,255,255,0.22), inset 0 -2px 5px rgba(17,13,10,0.1)';
const seekGlassShadow =
  '6px 9px 18px rgba(17,13,10,0.16), inset 0 1px 1px rgba(255,255,255,0.22), inset 0 -2px 5px rgba(17,13,10,0.08)';
const rateGlassShadow =
  '7px 10px 18px rgba(17,13,10,0.16), inset 0 1px 1px rgba(255,255,255,0.22), inset 0 -2px 5px rgba(17,13,10,0.08)';
const hudFadeIn = FadeIn.duration(180);
const hudFadeOut = FadeOut.duration(rowHudFadeOutDurationMs);

type FullscreenHudSymbolProps = {
  fallbackGlyph?: string;
  fallbackIconName?: keyof typeof MaterialIcons.glyphMap;
  iosSymbol: 'backward.fill' | 'forward.fill' | 'play.fill' | 'speedometer';
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
              letterSpacing: -1,
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

function RowPlaybackHudOverlayComponent({
  hudState,
  showCenteredPause,
}: RowPlaybackHudOverlayProps) {
  const transientFeedback = hudState.transientFeedback;

  if (!showCenteredPause && !transientFeedback) {
    return null;
  }

  return (
    <RowHudAnchors
      center={
        showCenteredPause ? (
        <Animated.View
          key="pause"
          entering={hudFadeIn}
          exiting={hudFadeOut}
        >
          <AdaptiveGlass
            appearance="clear"
            radius={34}
            style={{
              width: 68,
              height: 68,
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: pauseGlassShadow,
            }}
            variant="pill"
          >
            <FullscreenHudSymbol
              fallbackGlyph="▶"
              iosSymbol="play.fill"
              size={30}
            />
          </AdaptiveGlass>
        </Animated.View>
        ) : null
      }
      leftCenter={
        transientFeedback?.kind === 'seek' && transientFeedback.deltaSeconds < 0 ? (
        <Animated.View
          key="seek-left"
          entering={hudFadeIn}
          exiting={hudFadeOut}
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
              fallbackIconName="fast-rewind"
              iosSymbol="backward.fill"
              size={24}
            />
          </AdaptiveGlass>
        </Animated.View>
        ) : null
      }
      rightCenter={
        transientFeedback?.kind === 'seek' && transientFeedback.deltaSeconds > 0 ? (
          <Animated.View
            key="seek-right"
            entering={hudFadeIn}
            exiting={hudFadeOut}
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
                fallbackIconName="fast-forward"
                iosSymbol="forward.fill"
                size={24}
              />
            </AdaptiveGlass>
          </Animated.View>
        ) : null
      }
      top={
        transientFeedback?.kind === 'rate' ? (
        <Animated.View
          key="rate"
          entering={hudFadeIn}
          exiting={hudFadeOut}
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
              {transientFeedback.label}
            </Text>
          </AdaptiveGlass>
        </Animated.View>
        ) : null
      }
    />
  );
}

export const RowPlaybackHudOverlay = memo(RowPlaybackHudOverlayComponent);
