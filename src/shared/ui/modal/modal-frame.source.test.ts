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

  it('provides a content height budget to modal children', () => {
    const frameSource = readFileSync(
      resolve(process.cwd(), 'src/shared/ui/modal/ModalFrame.tsx'),
      'utf8'
    );
    const layoutSource = readFileSync(
      resolve(process.cwd(), 'src/shared/ui/modal/modal-content-layout.tsx'),
      'utf8'
    );
    const indexSource = readFileSync(
      resolve(process.cwd(), 'src/shared/ui/modal/index.ts'),
      'utf8'
    );

    expect(frameSource).toContain('ModalContentLayoutProvider');
    expect(frameSource).toContain('dialogContentMaxHeight');
    expect(frameSource).toContain('maxHeight - tokens.spacing.xxl * 2');
    expect(layoutSource).toContain('contentMaxHeight');
    expect(layoutSource).toContain('useModalContentLayout');
    expect(indexSource).toContain('useModalContentLayout');
    expect(indexSource).toContain('ModalContentLayoutProvider');
  });
});
