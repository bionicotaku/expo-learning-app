import { memo, type ReactNode } from 'react';
import { View } from 'react-native';

type RowHudAnchorsProps = {
  center?: ReactNode;
  leftCenter?: ReactNode;
  rightCenter?: ReactNode;
  top?: ReactNode;
};

const centerSlotStyle = {
  position: 'absolute' as const,
  inset: 0,
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
};

function RowHudAnchorsComponent({
  center,
  leftCenter,
  rightCenter,
  top,
}: RowHudAnchorsProps) {
  if (!center && !leftCenter && !rightCenter && !top) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        inset: 0,
      }}
    >
      {center ? <View style={centerSlotStyle}>{center}</View> : null}

      {leftCenter ? (
        <View
          style={{
            ...centerSlotStyle,
            transform: [{ translateX: -122 }],
          }}
        >
          {leftCenter}
        </View>
      ) : null}

      {rightCenter ? (
        <View
          style={{
            ...centerSlotStyle,
            transform: [{ translateX: 122 }],
          }}
        >
          {rightCenter}
        </View>
      ) : null}

      {top ? (
        <View
          style={{
            position: 'absolute',
            top: '15%',
            alignSelf: 'center',
          }}
        >
          {top}
        </View>
      ) : null}
    </View>
  );
}

export const RowHudAnchors = memo(RowHudAnchorsComponent);
