import { memo } from 'react';
import { Text, View } from 'react-native';

import { AdaptiveGlass } from '@/shared/ui/editorial-paper';
import { formatFullscreenVideoCounterLabel } from '../model/overlay-data';

type TopChromeOverlayProps = {
  activeIndex: number | null;
  topInset: number;
  totalItems: number;
};

const iconTint = 'rgba(251,247,238,0.96)';

export function TopChromeOverlayComponent({
  activeIndex,
  topInset,
  totalItems,
}: TopChromeOverlayProps) {
  const counterLabel = formatFullscreenVideoCounterLabel(activeIndex, totalItems);

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
      {counterLabel ? (
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
              {counterLabel}
            </Text>
          </AdaptiveGlass>
        </View>
      ) : null}
    </View>
  );
}

export const TopChromeOverlay = memo(TopChromeOverlayComponent);
