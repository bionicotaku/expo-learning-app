import type { AuthLoginMode } from './auth-ui-state';

export function resolveAuthLoginModeLabel(mode: AuthLoginMode) {
  switch (mode) {
    case 'code':
      return '验证码';
    case 'password':
    default:
      return '密码';
  }
}
