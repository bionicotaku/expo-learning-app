import { memo, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { AdaptiveGlass } from '@/shared/ui/editorial-paper';
import { formatFullscreenVideoDebugLabel } from '../model/overlay-data';
import { VideoOverlayActionRail } from './video-overlay-action-rail';

type ActiveVideoOverlayProps = {
  activeIndex: number | null;
  bottomInset: number;
  onPressBack: () => void;
  topInset: number;
  totalItems: number;
};

const iconTint = 'rgba(251,247,238,0.96)';

function ActiveVideoOverlayComponent({
  activeIndex,
  bottomInset,
  onPressBack,
  topInset,
  totalItems,
}: ActiveVideoOverlayProps) {
  const debugLabel = useMemo(
    () => formatFullscreenVideoDebugLabel(activeIndex, totalItems),
    [activeIndex, totalItems]
  );

  if (activeIndex === null) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        inset: 0,
      }}
    >
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          top: topInset + 16,
          left: 18,
        }}
      >
        <Pressable
          accessibilityLabel="Back"
          accessibilityRole="button"
          onPress={onPressBack}
          style={({ pressed }) => ({
            opacity: pressed ? 0.92 : 1,
            transform: [{ scale: pressed ? 0.97 : 1 }],
          })}
        >
          <AdaptiveGlass
            appearance="clear"
            interactive
            radius={27}
            style={{
              width: 54,
              height: 54,
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow:
                '5px 8px 14px rgba(17,13,10,0.14), inset 0 1px 1px rgba(255,255,255,0.2), inset 0 -2px 5px rgba(17,13,10,0.08)',
            }}
            variant="pill"
          >
            <View pointerEvents="none">
              <SymbolView
                fallback={
                  <Text
                    style={{
                      color: iconTint,
                      fontSize: 24,
                      lineHeight: 24,
                      fontWeight: '700',
                      textShadowColor: 'rgba(17,13,10,0.22)',
                      textShadowOffset: { width: 1, height: 1 },
                      textShadowRadius: 2,
                    }}
                  >
                    ‹
                  </Text>
                }
                name={{ ios: 'chevron.left' }}
                size={24}
                tintColor={iconTint}
                type="hierarchical"
                weight="semibold"
              />
            </View>
          </AdaptiveGlass>
        </Pressable>
      </View>

      {debugLabel ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: topInset + 22,
            right: 18,
          }}
        >
          <AdaptiveGlass
            appearance="clear"
            radius={999}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
            variant="pill"
          >
            <Text
              selectable
              style={{
                color: iconTint,
                fontSize: 13,
                fontVariant: ['tabular-nums'],
                fontWeight: '700',
                textShadowColor: 'rgba(17,13,10,0.22)',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 2,
              }}
            >
              {debugLabel}
            </Text>
          </AdaptiveGlass>
        </View>
      ) : null}

      <VideoOverlayActionRail bottomInset={bottomInset} />
    </View>
  );
}

export const ActiveVideoOverlay = memo(ActiveVideoOverlayComponent);
