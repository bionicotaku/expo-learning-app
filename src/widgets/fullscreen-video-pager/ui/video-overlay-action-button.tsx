import { SymbolView } from 'expo-symbols';
import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AdaptiveGlass } from '@/shared/ui/editorial-paper';
import type { FullscreenVideoOverlayActionItem } from '../model/overlay-data';

type VideoOverlayActionButtonProps = {
  item: FullscreenVideoOverlayActionItem;
  onPress?: () => void;
  size?: number;
};

const iconTint = 'rgba(251,247,238,0.96)';

function VideoOverlayActionButtonComponent({
  item,
  onPress,
  size = 54,
}: VideoOverlayActionButtonProps) {
  return (
    <Pressable
      accessibilityLabel={item.accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.92 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <AdaptiveGlass
        appearance="clear"
        interactive
        radius={size / 2}
        style={{
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow:
            '5px 8px 14px rgba(17,13,10,0.14), inset 0 1px 1px rgba(255,255,255,0.2), inset 0 -2px 5px rgba(17,13,10,0.08)',
        }}
        variant="pill"
      >
        <View
          pointerEvents="none"
          style={{
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SymbolView
            fallback={
              <Text
                style={{
                  color: iconTint,
                  fontSize: 22,
                  lineHeight: 22,
                  fontWeight: '700',
                  textShadowColor: 'rgba(17,13,10,0.22)',
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 2,
                }}
              >
                {item.fallbackGlyph}
              </Text>
            }
            name={{ ios: item.iosSymbol }}
            size={22}
            tintColor={iconTint}
            type="hierarchical"
            weight="semibold"
          />
        </View>
      </AdaptiveGlass>
    </Pressable>
  );
}

export const VideoOverlayActionButton = memo(VideoOverlayActionButtonComponent);
