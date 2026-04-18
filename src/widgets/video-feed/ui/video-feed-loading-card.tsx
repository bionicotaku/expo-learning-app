import { ActivityIndicator, Text, View } from 'react-native';

import { colors } from '@/shared/theme/colors';

type VideoFeedLoadingCardProps = {
  width: number;
  height: number;
  title: string;
  subtitle: string;
};

export function VideoFeedLoadingCard({
  width,
  height,
  title,
  subtitle,
}: VideoFeedLoadingCardProps) {
  return (
    <View
      style={{
        width,
        height,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        gap: 14,
      }}>
      <ActivityIndicator color={colors.textPrimary} size="large" />
      <Text
        selectable
        style={{ color: colors.textPrimary, fontSize: 20, fontWeight: '800', textAlign: 'center' }}>
        {title}
      </Text>
      <Text
        selectable
        style={{ color: colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 }}>
        {subtitle}
      </Text>
    </View>
  );
}
