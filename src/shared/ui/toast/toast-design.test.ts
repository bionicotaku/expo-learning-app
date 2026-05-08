import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import {
  TOAST_CONTAINER_MIN_HEIGHT,
  TOAST_ENTER_TRANSLATE_Y,
  TOAST_STACK_GAP,
  TOAST_STACK_PUSH_TRANSLATE_Y,
  TOAST_TOP_OFFSET,
  shouldDismissToastGesture,
  withToastAlpha,
} from './toast-design';

describe('toast design helpers', () => {
  it('marks the gesture dismiss predicate as a worklet for UI-thread gesture callbacks', () => {
    const source = readFileSync(
      new URL('./toast-design.ts', import.meta.url).pathname,
      'utf8'
    );

    expect(source).toContain('export function shouldDismissToastGesture');
    expect(source).toContain("'worklet';");
  });

  it('keeps the host offset below the safe-area top edge', () => {
    expect(TOAST_TOP_OFFSET).toBeGreaterThanOrEqual(12);
  });

  it('uses a full stack push distance for enter and layout movement', () => {
    const designSource = readFileSync(
      new URL('./toast-design.ts', import.meta.url).pathname,
      'utf8'
    );
    const cardSource = readFileSync(
      new URL('./ToastCard.tsx', import.meta.url).pathname,
      'utf8'
    );

    expect(TOAST_ENTER_TRANSLATE_Y).toBe(TOAST_STACK_PUSH_TRANSLATE_Y);
    expect(Math.abs(TOAST_STACK_PUSH_TRANSLATE_Y)).toBeGreaterThan(
      TOAST_CONTAINER_MIN_HEIGHT + TOAST_STACK_GAP
    );
    expect(designSource).toContain(
      'export const TOAST_ENTER_TRANSLATE_Y = TOAST_STACK_PUSH_TRANSLATE_Y;'
    );
    expect(cardSource).toContain(
      'LinearTransition.duration(TOAST_ENTER_DURATION_MS).easing('
    );
    expect(cardSource).toContain('Easing.out(Easing.cubic)');
  });

  it('builds the expected alpha composited color', () => {
    expect(withToastAlpha('#34C759', 0.2)).toBe('#34C75933');
    expect(withToastAlpha('#FF3B30', 0.75)).toBe('#FF3B30bf');
  });

  it('dismisses when the upward translation reaches the threshold', () => {
    expect(
      shouldDismissToastGesture({
        translationY: -36,
        velocityY: -100,
      })
    ).toBe(true);
  });

  it('dismisses when the upward fling reaches the threshold', () => {
    expect(
      shouldDismissToastGesture({
        translationY: -8,
        velocityY: -650,
      })
    ).toBe(true);
  });

  it('keeps the toast when the gesture does not reach either threshold', () => {
    expect(
      shouldDismissToastGesture({
        translationY: -20,
        velocityY: -220,
      })
    ).toBe(false);
  });
});
