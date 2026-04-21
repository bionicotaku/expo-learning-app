import type { AuthScreenState } from './auth-ui-state';

export type AuthPrimaryAction =
  | {
      type: 'navigate';
      href: '/feed';
      method: 'replace';
    }
  | {
      type: 'noop';
    };

export function resolveAuthPrimaryAction(
  screen: AuthScreenState
): AuthPrimaryAction {
  if (screen === 'login') {
    return {
      type: 'navigate',
      href: '/feed',
      method: 'replace',
    };
  }

  return {
    type: 'noop',
  };
}
