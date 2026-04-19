import type { ReactNode } from 'react';

import { ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';
import { EditorialTitle } from '@/shared/ui/editorial-paper';

type AuthPageShellProps = {
  card: ReactNode;
  footer: ReactNode;
  socialRow?: ReactNode;
};

export function AuthPageShell({ card, footer, socialRow = null }: AuthPageShellProps) {
  const { tokens } = useEditorialPaperTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const minContentHeight = Math.max(0, height - insets.top - insets.bottom);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: tokens.color.background }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        flexGrow: 1,
        minHeight: minContentHeight,
        paddingHorizontal: 24,
        paddingBottom: Math.max(insets.bottom, 28),
      }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'space-between',
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <View style={{ width: '100%', maxWidth: 360, alignSelf: 'center' }}>
            <EditorialTitle
              variant="display"
              style={{
                fontSize: 48,
                lineHeight: 47,
                letterSpacing: -1.6,
              }}
            >
              learnability
            </EditorialTitle>
            <Text
              style={{
                marginTop: 16,
                maxWidth: 302,
                fontSize: 14.5,
                lineHeight: 23,
                fontWeight: '500',
                color: tokens.color.inkSoft,
              }}
            >
              AI 加速学习系统
            </Text>

            <View style={{ marginTop: 30 }}>{card}</View>
            {socialRow ? <View>{socialRow}</View> : null}
          </View>
        </View>

        <View
          style={{
            paddingTop: 16,
            alignItems: 'center',
          }}
        >
          {footer}
        </View>
      </View>
    </ScrollView>
  );
}
