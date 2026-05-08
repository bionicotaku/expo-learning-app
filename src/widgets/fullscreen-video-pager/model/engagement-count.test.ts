import { describe, expect, it } from 'vitest';

import {
  formatEngagementCount,
  resolveEffectiveEngagementCount,
} from './engagement-count';

describe('engagement count helpers', () => {
  it('formats counts below ten thousand as the full number', () => {
    expect(formatEngagementCount(0)).toBe('0');
    expect(formatEngagementCount(9999)).toBe('9999');
  });

  it('formats counts at or above ten thousand with the 万 unit', () => {
    expect(formatEngagementCount(10000)).toBe('1万');
    expect(formatEngagementCount(10500)).toBe('1.1万');
    expect(formatEngagementCount(12000)).toBe('1.2万');
  });

  it('increments or decrements the base count from the base and effective active states', () => {
    expect(
      resolveEffectiveEngagementCount({
        baseCount: 8000,
        baseIsActive: false,
        effectiveIsActive: true,
      })
    ).toBe(8001);
    expect(
      resolveEffectiveEngagementCount({
        baseCount: 8000,
        baseIsActive: true,
        effectiveIsActive: false,
      })
    ).toBe(7999);
    expect(
      resolveEffectiveEngagementCount({
        baseCount: 8000,
        baseIsActive: true,
        effectiveIsActive: true,
      })
    ).toBe(8000);
  });
});
