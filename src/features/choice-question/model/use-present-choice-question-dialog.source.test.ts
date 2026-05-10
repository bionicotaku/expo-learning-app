import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('use present choice question dialog source', () => {
  it('presents choice questions through the shared dialog modal', () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        'src/features/choice-question/model/use-present-choice-question-dialog.tsx'
      ),
      'utf8'
    );

    expect(source).toContain("import { useModalController } from '@/shared/lib/modal';");
    expect(source).toContain("presentation: 'dialog'");
    expect(source).toContain("debugLabel: 'choice-question'");
    expect(source).toContain('ChoiceQuestionDialogContent');
    expect(source).toContain('ChoiceQuestionDialogData');
    expect(source).toContain('const presentResult = modal.present({');
    expect(source).toContain('return presentResult.didPresent;');
    expect(source).toContain('<ChoiceQuestionDialogContent payload={payload} />');
    expect(source).not.toContain("presentation: 'sheet'");
    expect(source).not.toContain('router.');
    expect(source).not.toContain('fetch(');
    expect(source).not.toContain('toast.');
  });
});
