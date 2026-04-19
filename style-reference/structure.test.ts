import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const styleReferenceDir = join(process.cwd(), 'style-reference');

function readRelative(path: string) {
  return readFileSync(join(styleReferenceDir, path), 'utf8');
}

describe('style-reference structure', () => {
  it('uses index.html as the human-facing entrypoint', () => {
    expect(existsSync(join(styleReferenceDir, 'index.html'))).toBe(true);

    const html = readRelative('index.html');
    expect(html).toContain('visual-reference-base.jsx');
    expect(html).toContain('style-reference-main.jsx');
    expect(html).not.toContain('styleC-screens.jsx');
    expect(html).not.toContain('design-canvas.jsx');
    expect(html).not.toContain('ios-frame.jsx');
  });

  it('documents the split between human-facing base and agent-facing style source', () => {
    expect(existsSync(join(styleReferenceDir, 'README.md'))).toBe(true);

    const readme = readRelative('README.md');
    expect(readme).toContain('index.html');
    expect(readme).toContain('visual-reference-base.jsx');
    expect(readme).toContain('style-reference-main.jsx');
    expect(readme).toContain('agent');
  });
});
