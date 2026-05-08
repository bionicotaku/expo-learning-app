import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('ModalHost source', () => {
  it('renders a singleton current modal without list rendering', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/shared/ui/modal/ModalHost.tsx'),
      'utf8'
    );

    expect(source).toContain('const currentModal = useSyncExternalStore(');
    expect(source).toContain("currentModal.phase !== 'exiting'");
    expect(source).toContain('visible={isBackdropVisible}');
    expect(source).toContain('currentModal ? (');
    expect(source).not.toContain('resolveTopmostModalId');
    expect(source).not.toContain('items.map');
    expect(source).not.toContain('stackIndex=');
    expect(source).not.toContain('isTopMost=');
  });
});
