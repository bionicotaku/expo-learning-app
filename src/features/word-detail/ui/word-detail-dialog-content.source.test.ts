import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('word detail dialog content source', () => {
  it('renders text, base form, context explanation, and dictionary without showing coarse id or reason', () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        'src/features/word-detail/ui/word-detail-dialog-content.tsx'
      ),
      'utf8'
    );

    expect(source).toContain('WordDetailDialogPayload');
    expect(source).toContain('semantic_element');
    expect(source).toContain('base_form');
    expect(source).toContain('coarse_id');
    expect(source).toContain('coarse_id: number | null');
    expect(source).toContain('上下文释义');
    expect(source).toContain('字典释义');
    expect(source).toContain('payload.text');
    expect(source).toContain('payload.semantic_element.base_form');
    expect(source).toContain('payload.explanation');
    expect(source).toContain('payload.semantic_element.dictionary');
    expect(source).not.toContain('payload.semantic_element.coarse_id');
    expect(source).not.toContain('reason');
    expect(source).not.toContain('Pressable');
    expect(source).not.toContain('onDismiss');
    expect(source).not.toContain('Close');
    expect(source).not.toContain('Close word detail');
    expect(source).not.toContain('<RaisedSurface');
    expect(source).not.toContain("tone=\"background\"");
  });
});
