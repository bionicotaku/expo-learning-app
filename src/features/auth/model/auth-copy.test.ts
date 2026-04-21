import { describe, expect, it } from 'vitest';

import { resolveAuthLoginModeLabel } from './auth-copy';

describe('auth copy', () => {
  it('uses compact labels for login modes', () => {
    expect(resolveAuthLoginModeLabel('password')).toBe('密码');
    expect(resolveAuthLoginModeLabel('code')).toBe('验证码');
  });
});
