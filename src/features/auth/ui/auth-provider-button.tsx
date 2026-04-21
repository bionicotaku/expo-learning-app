import { Pressable, Text, View } from 'react-native';

import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';
import { RaisedSurface } from '@/shared/ui/editorial-paper';

type AuthProvider = 'apple' | 'google' | 'wechat';

type AuthProviderButtonProps = {
  provider: AuthProvider;
};

const providerGlyphs: Record<AuthProvider, string> = {
  apple: 'A',
  google: 'G',
  wechat: 'W',
};

export function AuthProviderButton({ provider }: AuthProviderButtonProps) {
  const { tokens } = useEditorialPaperTheme();

  return (
    <Pressable accessibilityRole="button" style={{ flex: 1 }}>
      {({ pressed }) => (
        <RaisedSurface
          radius="control"
          style={{
            minHeight: 48,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.95 : 1,
          }}
        >
          <View
            style={{
              width: 18,
              height: 18,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 15,
                lineHeight: 18,
                fontWeight: provider === 'google' ? '800' : '700',
                color:
                  provider === 'google'
                    ? '#6E4E42'
                    : provider === 'wechat'
                      ? tokens.color.cocoa
                      : tokens.color.ink,
              }}
            >
              {providerGlyphs[provider]}
            </Text>
          </View>
        </RaisedSurface>
      )}
    </Pressable>
  );
}
