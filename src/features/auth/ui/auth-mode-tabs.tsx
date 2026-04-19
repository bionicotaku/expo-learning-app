import { Pressable, Text, View } from 'react-native';

import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';
import { InsetSurface, RaisedSurface } from '@/shared/ui/editorial-paper';

import type { AuthLoginMode } from '../model/auth-ui-state';

type AuthModeTabsProps = {
  activeMode: AuthLoginMode;
  onChangeMode: (mode: AuthLoginMode) => void;
};

const tabItems: readonly {
  mode: AuthLoginMode;
  label: string;
  tone: 'softActionPeach' | 'softActionButter';
}[] = [
  {
    mode: 'password',
    label: '密码登录',
    tone: 'softActionPeach',
  },
  {
    mode: 'code',
    label: '验证码登录',
    tone: 'softActionButter',
  },
];

export function AuthModeTabs({ activeMode, onChangeMode }: AuthModeTabsProps) {
  const { tokens } = useEditorialPaperTheme();

  return (
    <InsetSurface
      radius="pill"
      style={{
        padding: 6,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          gap: tokens.spacing.xs,
        }}
      >
        {tabItems.map((item) => {
          const selected = item.mode === activeMode;

          return (
            <Pressable
              key={item.mode}
              accessibilityRole="button"
              onPress={() => onChangeMode(item.mode)}
              style={{ flex: 1 }}
            >
              {selected ? (
                <RaisedSurface
                  tone={item.tone}
                  radius="pill"
                  style={{
                    minHeight: 34,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '700',
                      color: '#6E4E42',
                      letterSpacing: 0.2,
                    }}
                  >
                    {item.label}
                  </Text>
                </RaisedSurface>
              ) : (
                <View
                  style={{
                    minHeight: 34,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: tokens.spacing.md,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: tokens.color.inkSoft,
                    }}
                  >
                    {item.label}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </InsetSurface>
  );
}
