import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('use present choice question set dialog source', () => {
  it('presents choice question sets through the shared dialog modal', () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        'src/features/choice-question/model/use-present-choice-question-set-dialog.tsx'
      ),
      'utf8'
    );

    expect(source).toContain("import { useModalController } from '@/shared/lib/modal';");
    expect(source).toContain("presentation: 'dialog'");
    expect(source).toContain("debugLabel: 'choice-question-set'");
    expect(source).toContain('ChoiceQuestionSetDialogContent');
    expect(source).toContain('ChoiceQuestionSetDialogData');
    expect(source).toContain('const presentResult = modal.present({');
    expect(source).toContain('dismissOnBackdropPress: false');
    expect(source).toContain('return presentResult.didPresent;');
    expect(source).toContain('render: ({ dismiss }) => (');
    expect(source).toContain('<ChoiceQuestionSetDialogContent onDismiss={dismiss} payload={payload} />');
    expect(source).toContain('usePresentChoiceQuestionSetDialogAndWait');
    expect(source).toContain('new Promise<boolean>');
    expect(source).toContain('onDidDismiss');
    expect(source).toContain('resolve(true)');
    expect(source).toContain('resolve(false)');
    expect(source).not.toContain("presentation: 'sheet'");
    expect(source).not.toContain('usePresentChoiceQuestionDialog');
    expect(source).not.toContain('router.');
    expect(source).not.toContain('fetch(');
    expect(source).not.toContain('toast.');
  });
});
