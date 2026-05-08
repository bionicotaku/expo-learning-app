import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('modal frame source', () => {
  it('keeps shared modal frames free of external glow', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/shared/ui/modal/ModalFrame.tsx'),
      'utf8'
    );

    expect(source).not.toContain('boxShadow');
    expect(source).not.toContain('tokens.elevation.raised');
    expect(source).not.toContain('tokens.elevation.soft');
  });
});
