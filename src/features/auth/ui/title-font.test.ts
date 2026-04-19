import { describe, expect, it } from 'vitest';

import {
  resolveStructuredAuthTitleFontFamily,
  shouldUseEditorialDisplayFont,
} from './title-font';

describe('structured auth title fonts', () => {
  it('uses the editorial display font for latin titles', () => {
    expect(shouldUseEditorialDisplayFont('Forgot password')).toBe(true);
    expect(
      resolveStructuredAuthTitleFontFamily(
        'Forgot password',
        'Fraunces',
        'TW-Kai-98_1'
      )
    ).toBe('Fraunces');
  });

  it('uses the dedicated chinese fallback font for CJK titles', () => {
    expect(shouldUseEditorialDisplayFont('忘记密码')).toBe(false);
    expect(shouldUseEditorialDisplayFont('注册')).toBe(false);
    expect(
      resolveStructuredAuthTitleFontFamily('忘记密码', 'Fraunces', 'TW-Kai-98_1')
    ).toBe('TW-Kai-98_1');
    expect(
      resolveStructuredAuthTitleFontFamily('注册', 'Fraunces', 'TW-Kai-98_1')
    ).toBe('TW-Kai-98_1');
  });
});
