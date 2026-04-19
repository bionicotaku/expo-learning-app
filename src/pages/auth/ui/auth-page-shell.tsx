import type { ReactNode } from 'react';

import { Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';
import { EditorialTitle } from '@/shared/ui/editorial-paper';

import { resolveAuthPageShellLayout } from './layout';

type AuthPageShellProps = {
  card: ReactNode;
  footer: ReactNode;
  socialRow?: ReactNode;
};

export function AuthPageShell({ card, footer, socialRow = null }: AuthPageShellProps) {
  const { tokens } = useEditorialPaperTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const layout = resolveAuthPageShellLayout(height);

  return (
    <View
      style={{ flex: 1, backgroundColor: tokens.color.background }}
    >
      <View
        style={{
          flex: 1,
          paddingTop: Math.max(insets.top, 20),
          paddingBottom: Math.max(insets.bottom, 24),
          paddingHorizontal: 24,
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
                fontSize: layout.displayFontSize,
                lineHeight: layout.displayLineHeight,
                letterSpacing: layout.displayLetterSpacing,
              }}
            >
              learnability
            </EditorialTitle>
            <Text
              style={{
                marginTop: layout.subtitleMarginTop,
                maxWidth: 302,
                fontSize: 14.5,
                lineHeight: 23,
                fontWeight: '500',
                color: tokens.color.inkSoft,
              }}
            >
              AI 加速学习系统
            </Text>

            <View style={{ marginTop: layout.cardMarginTop }}>{card}</View>
            {socialRow ? <View>{socialRow}</View> : null}
          </View>
        </View>

        <View
          style={{
            paddingTop: layout.footerPaddingTop,
            alignItems: 'center',
          }}
        >
          {footer}
        </View>
      </View>
      </View>
    </View>
  );
}
