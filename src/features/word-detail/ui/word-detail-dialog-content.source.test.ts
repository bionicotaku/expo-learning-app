import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('word detail dialog content source', () => {
  it('renders title, optional subtitle, and caller-provided sections without fixed semantic fields', () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        'src/features/word-detail/ui/word-detail-dialog-content.tsx'
      ),
      'utf8'
    );

    expect(source).toContain('WordDetailDialogData');
    expect(source).toContain('WordDetailDialogSection');
    expect(source).toContain('title: string');
    expect(source).toContain('subtitle?: string');
    expect(source).toContain('sections: WordDetailDialogSection[]');
    expect(source).toContain('payload.title');
    expect(source).toContain('payload.subtitle ?');
    expect(source).toContain('payload.sections.map');
    expect(source).toContain('section.id');
    expect(source).toContain('section.title');
    expect(source).toContain('section.body');
    expect(source).not.toContain('semantic_element');
    expect(source).not.toContain('base_form');
    expect(source).not.toContain('coarse_id');
    expect(source).not.toContain('display?:');
    expect(source).not.toContain('showBaseForm');
    expect(source).not.toContain('explanationTitle');
    expect(source).not.toContain('payload.explanation');
    expect(source).not.toContain('payload.semantic_element');
    expect(source).not.toContain('上下文释义');
    expect(source).not.toContain('字典释义');
    expect(source).not.toContain('reason');
    expect(source).not.toContain('Pressable');
    expect(source).not.toContain('onDismiss');
    expect(source).not.toContain('Close');
    expect(source).not.toContain('Close word detail');
    expect(source).not.toContain('<RaisedSurface');
    expect(source).not.toContain("tone=\"background\"");
  });
});
