import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('use present word detail dialog source', () => {
  it('presents word details through the shared dialog modal', () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        'src/features/word-detail/model/use-present-word-detail-dialog.tsx'
      ),
      'utf8'
    );

    expect(source).toContain("import { useModalController } from '@/shared/lib/modal';");
    expect(source).toContain("presentation: 'dialog'");
    expect(source).toContain("debugLabel: 'word-detail'");
    expect(source).toContain('WordDetailDialogContent');
    expect(source).toContain('WordDetailDialogLifecycleBoundary');
    expect(source).toContain('onDismissComplete');
    expect(source).toContain('const presentResult = modal.present({');
    expect(source).toContain('return presentResult.didPresent;');
    expect(source).toContain('<WordDetailDialogContent payload={payload} />');
    expect(source).toContain('WordDetailDialogPayload');
    expect(source).not.toContain("presentation: 'sheet'");
    expect(source).not.toContain('router.');
    expect(source).not.toContain('fetch(');
  });
});
