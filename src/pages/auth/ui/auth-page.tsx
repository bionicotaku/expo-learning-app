import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useReducer } from 'react';
import { Pressable, Text } from 'react-native';

import {
  AuthSocialRow,
  createInitialAuthUiState,
  LoginEntryCard,
  reduceAuthUiState,
  resolveAuthPrimaryAction,
  StructuredAuthCard,
} from '@/features/auth';
import type { AuthScreenState } from '@/features/auth';
import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';

import { AuthPageShell } from './auth-page-shell';

function AuthFooter({
  screen,
  onNavigateToLogin,
  onNavigateToRegister,
}: {
  screen: AuthScreenState;
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
}) {
  const { tokens } = useEditorialPaperTheme();
  const isLogin = screen === 'login';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={isLogin ? onNavigateToRegister : onNavigateToLogin}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 0,
      }}
    >
      <Text
        style={{
          fontSize: 11,
          lineHeight: 15,
          fontWeight: '500',
          color: tokens.color.inkMute,
        }}
      >
        {isLogin ? '新用户? ' : '已有账号？'}
      </Text>
      <Text
        style={{
          fontSize: 11,
          lineHeight: 15,
          fontWeight: '700',
          color: '#6E4E42',
        }}
      >
        {isLogin ? '注册 ↗' : '登录 ↗'}
      </Text>
    </Pressable>
  );
}

export function AuthPage() {
  const router = useRouter();
  const [state, dispatch] = useReducer(
    reduceAuthUiState,
    undefined,
    createInitialAuthUiState
  );

  const card = useMemo(() => {
    if (state.screen === 'forgotPassword') {
      return <StructuredAuthCard title="忘记密码" />;
    }

    if (state.screen === 'register') {
      return <StructuredAuthCard title="注册" />;
    }

    return (
      <LoginEntryCard
        mode={state.loginMode}
        onChangeMode={(mode) => dispatch({ type: 'set-login-mode', mode })}
        onPressForgotPassword={() => dispatch({ type: 'show-forgot-password' })}
        onPressSubmit={() => {
          const action = resolveAuthPrimaryAction(state.screen);
          if (action.type === 'navigate') {
            router.replace(action.href);
          }
        }}
      />
    );
  }, [router, state.loginMode, state.screen]);

  return (
    <>
      <StatusBar style="dark" />
      <AuthPageShell
        card={card}
        socialRow={state.screen === 'login' ? <AuthSocialRow /> : null}
        footer={
          <AuthFooter
            screen={state.screen}
            onNavigateToLogin={() => dispatch({ type: 'show-login' })}
            onNavigateToRegister={() => dispatch({ type: 'show-register' })}
          />
        }
      />
    </>
  );
}
