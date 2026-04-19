import { memo } from 'react';
import { Text, View } from 'react-native';

type ActiveVideoOverlayProps = {
  activeIndex: number | null;
  topInset: number;
  totalItems: number;
};

function ActiveVideoOverlayComponent({
  activeIndex,
  topInset,
  totalItems,
}: ActiveVideoOverlayProps) {
  if (activeIndex === null) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: topInset + 20,
        left: 18,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: 'rgba(0,0,0,0.42)',
      }}
    >
      <Text
        selectable
        style={{
          color: '#FFFFFF',
          fontSize: 14,
          fontVariant: ['tabular-nums'],
          fontWeight: '700',
        }}
      >
        {`${activeIndex + 1} / ${totalItems}`}
      </Text>
    </View>
  );
}

export const ActiveVideoOverlay = memo(ActiveVideoOverlayComponent);
