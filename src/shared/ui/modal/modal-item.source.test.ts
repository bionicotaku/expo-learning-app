import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('ModalItem source', () => {
  it('does not use layered modal semantics for singleton gestures', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/shared/ui/modal/ModalItem.tsx'),
      'utf8'
    );

    expect(source).toContain(
      "record.presentation === 'sheet' && record.phase !== 'exiting'"
    );
    expect(source).toContain("pointerEvents={record.phase === 'exiting' ? 'none' : 'auto'}");
    expect(source).not.toContain('isTopMost');
    expect(source).not.toContain('stackIndex');
    expect(source).not.toContain('MODAL_STACK_BASE_Z_INDEX');
  });
});
