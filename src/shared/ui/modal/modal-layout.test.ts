import { describe, expect, it } from 'vitest';

import {
  resolveDialogModalLayout,
  resolveSheetModalLayout,
  resolveTopmostModalId,
} from './modal-layout';

describe('modal layout helpers', () => {
  it('caps dialog width at the configured maximum and respects horizontal margins', () => {
    expect(
      resolveDialogModalLayout({
        viewportWidth: 390,
        viewportHeight: 844,
        topInset: 59,
        bottomInset: 34,
        horizontalMargin: 22,
        maxWidth: 420,
      })
    ).toEqual({
      width: 346,
      maxHeight: 707,
    });

    expect(
      resolveDialogModalLayout({
        viewportWidth: 834,
        viewportHeight: 1112,
        topInset: 24,
        bottomInset: 20,
        horizontalMargin: 22,
        maxWidth: 420,
      }).width
    ).toBe(420);
  });

  it('anchors the sheet to the viewport width and reserves the top safe area offset', () => {
    expect(
      resolveSheetModalLayout({
        viewportWidth: 390,
        viewportHeight: 844,
        topInset: 59,
        pageTopOffset: 58,
      })
    ).toEqual({
      width: 390,
      maxHeight: 727,
    });
  });

  it('returns the topmost modal id from the current stack order', () => {
    expect(resolveTopmostModalId([])).toBeNull();
    expect(
      resolveTopmostModalId([
        { id: 'modal-1' },
        { id: 'modal-2' },
        { id: 'modal-3' },
      ])
    ).toBe('modal-3');
  });
});
