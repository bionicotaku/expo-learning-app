import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('choice question dialog content source', () => {
  it('defines the MVP single-choice dialog contract and local reveal state', () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        'src/features/choice-question/ui/choice-question-dialog-content.tsx'
      ),
      'utf8'
    );

    expect(source).toContain('ChoiceQuestionKind');
    expect(source).toContain("'context_meaning'");
    expect(source).toContain("'general_meaning'");
    expect(source).toContain("'context_cloze'");
    expect(source).toContain("'reverse_recognition'");
    expect(source).toContain('ChoiceQuestionOption');
    expect(source).toContain('ChoiceQuestionDialogData');
    expect(source).toContain('isCorrect: boolean');
    expect(source).toContain('title?: string');
    expect(source).toContain('contextText?: string');
    expect(source).toContain('targetText?: string');
    expect(source).toContain('choiceQuestionKindLabels');
    expect(source).toContain('selectedOptionId');
    expect(source).toContain('wrongOptionIds');
    expect(source).toContain('const hasAnsweredCorrectly = selectedOptionId !== null;');
    expect(source).toContain('option.isCorrect');
    expect(source).toContain('optionNumber');
    expect(source).toContain("tokens.color.softAction.pistachio");
    expect(source).toContain("tokens.color.softAction.rose");
    expect(source).toContain('disabled={hasAnsweredCorrectly}');
    expect(source).toContain('payload.title ?');
    expect(source).toContain('payload.contextText ?');
    expect(source).not.toContain('payload.targetText ?');
    expect(source).not.toContain('onSubmit');
    expect(source).not.toContain('onCorrect');
    expect(source).not.toContain('onIncorrect');
    expect(source).not.toContain('fetch(');
    expect(source).not.toContain('toast.');
    expect(source).not.toContain('Close');
  });
});
