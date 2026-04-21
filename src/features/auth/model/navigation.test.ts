import { describe, expect, it } from 'vitest';

import { resolveAuthPrimaryAction } from '@/features/auth/model/navigation';

describe('resolveAuthPrimaryAction', () => {
  it('navigates to the feed home from the login screen', () => {
    expect(resolveAuthPrimaryAction('login')).toEqual({
      type: 'navigate',
      href: '/feed',
      method: 'replace',
    });
  });

  it('does not navigate from structured auth screens', () => {
    expect(resolveAuthPrimaryAction('forgotPassword')).toEqual({ type: 'noop' });
    expect(resolveAuthPrimaryAction('register')).toEqual({ type: 'noop' });
  });
});
