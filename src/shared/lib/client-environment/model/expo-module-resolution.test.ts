import { createRequire } from 'node:module';

import { describe, expect, it } from 'vitest';

describe('Expo module resolution for client environment', () => {
  it('resolves Expo environment modules without test mocks', () => {
    const require = createRequire(import.meta.url);

    expect(require.resolve('expo-constants')).toContain('node_modules/expo-constants');
    expect(require.resolve('expo-device')).toContain('node_modules/expo-device');
    expect(require.resolve('expo-modules-core')).toContain(
      'node_modules/expo-modules-core'
    );
  });
});
