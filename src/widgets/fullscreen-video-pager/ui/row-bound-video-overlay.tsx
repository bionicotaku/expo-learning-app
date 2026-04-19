import { Text, View } from 'react-native';

type RowBoundVideoOverlayProps = {
  bottomInset: number;
  title: string;
  subtitle: string;
};

export function RowBoundVideoOverlay({
  bottomInset,
  title,
  subtitle,
}: RowBoundVideoOverlayProps) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 18,
        right: 18,
        bottom: bottomInset + 28,
        gap: 8,
      }}
    >
      <Text selectable style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '800' }}>
        {title}
      </Text>
      <Text
        selectable
        style={{
          color: 'rgba(255,255,255,0.74)',
          fontSize: 15,
          lineHeight: 20,
          fontWeight: '500',
        }}
      >
        {subtitle}
      </Text>
    </View>
  );
}
