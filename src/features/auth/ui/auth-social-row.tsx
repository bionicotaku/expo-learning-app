import { View, Text } from 'react-native';

import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';

import { AuthProviderButton } from './auth-provider-button';

export function AuthSocialRow() {
  const { tokens } = useEditorialPaperTheme();

  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          marginTop: 22,
          marginBottom: 12,
        }}
      >
        <View
          style={{
            flex: 1,
            height: 1,
            backgroundColor: tokens.color.inkMute,
            opacity: 0.28,
          }}
        />
        <Text
          style={{
            ...tokens.typography.meta,
            color: tokens.color.inkMute,
          }}
        >
          OR
        </Text>
        <View
          style={{
            flex: 1,
            height: 1,
            backgroundColor: tokens.color.inkMute,
            opacity: 0.28,
          }}
        />
      </View>
      <View
        style={{
          flexDirection: 'row',
          gap: 10,
        }}
      >
        <AuthProviderButton provider="apple" />
        <AuthProviderButton provider="google" />
        <AuthProviderButton provider="wechat" />
      </View>
    </>
  );
}
