import { Pressable, Text, View } from 'react-native';

import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';
import { RaisedSurface } from '@/shared/ui/editorial-paper';

import type { AuthLoginMode } from '../model/auth-ui-state';
import { AuthCodeRow } from './auth-code-row';
import { AuthField } from './auth-field';
import { AuthModeTabs } from './auth-mode-tabs';
import { AuthPrimaryButton } from './auth-primary-button';

type LoginEntryCardProps = {
  mode: AuthLoginMode;
  onChangeMode: (mode: AuthLoginMode) => void;
  onPressForgotPassword: () => void;
};

export function LoginEntryCard({
  mode,
  onChangeMode,
  onPressForgotPassword,
}: LoginEntryCardProps) {
  const { tokens } = useEditorialPaperTheme();

  return (
    <RaisedSurface
      radius="cardLg"
      style={{
        paddingHorizontal: 22,
        paddingVertical: 22,
      }}
    >
      <AuthModeTabs activeMode={mode} onChangeMode={onChangeMode} />
      <View style={{ marginTop: 16 }}>
        <AuthField label="邮箱" value="mika@folio-press.app" />
        {mode === 'password' ? (
          <AuthField label="密码" value="•••••••••••" marginBottom={18} />
        ) : (
          <AuthCodeRow />
        )}
        <AuthPrimaryButton>登录</AuthPrimaryButton>
        <Pressable
          accessibilityRole="button"
          onPress={onPressForgotPassword}
          style={{
            marginTop: 14,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 12,
              lineHeight: 16,
              fontWeight: '500',
              color: tokens.color.inkSoft,
            }}
          >
            忘记密码?
          </Text>
        </Pressable>
      </View>
    </RaisedSurface>
  );
}
