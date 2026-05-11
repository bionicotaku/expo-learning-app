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
    expect(source).toContain('ChoiceQuestionAnswerDetail');
    expect(source).toContain('isCorrect: boolean');
    expect(source).toContain('title?: string');
    expect(source).toContain('answerDetail?: ChoiceQuestionAnswerDetail');
    expect(source).toContain('label: string');
    expect(source).toContain('pos: string');
    expect(source).toContain('chineseLabel: string');
    expect(source).toContain('explanation: string');
    expect(source).toContain('contextText?: string');
    expect(source).toContain('targetText?: string');
    expect(source).toContain('choiceQuestionKindLabels');
    expect(source).toContain('selectedOptionId');
    expect(source).toContain('wrongOptionIds');
    expect(source).toContain('const answerDetailToShow =');
    expect(source).toContain('wrongOptionIds.length > 0');
    expect(source).toContain('const hasAnsweredCorrectly = selectedOptionId !== null;');
    expect(source).toContain('option.isCorrect');
    expect(source).toContain('optionNumber');
    expect(source).toContain("tokens.color.softAction.pistachio");
    expect(source).toContain("tokens.color.softAction.rose");
    expect(source).toContain('disabled={hasAnsweredCorrectly}');
    expect(source).toContain('payload.title ?');
    expect(source).toContain('payload.contextText ?');
    expect(source).toContain('payload.answerDetail');
    expect(source).toContain('答案解析');
    expect(source).toContain('useSharedValue');
    expect(source).toContain('useAnimatedStyle');
    expect(source).toContain('withTiming');
    expect(source).toContain('withDelay');
    expect(source).toContain('answerRevealLayout');
    expect(source).toContain('answerDetailContentAnimatedStyle');
    expect(source).toContain('ANSWER_REVEAL_HEIGHT_DURATION_MS = 440');
    expect(source).toContain('ANSWER_DETAIL_FADE_DELAY_MS = 320');
    expect(source).toContain('ANSWER_DETAIL_FADE_DURATION_MS = 180');
    expect(source).toContain('onLayout={handleAnswerDetailLayout}');
    expect(source).not.toContain('LinearTransition');
    expect(source).not.toContain('FadeIn');
    expect(source).not.toContain('ScrollView');
    expect(source).not.toContain('maxHeight: 420');
    expect(source).not.toContain('payload.targetText ?');
    expect(source).not.toContain('onSubmit');
    expect(source).not.toContain('onCorrect');
    expect(source).not.toContain('onIncorrect');
    expect(source).not.toContain('fetch(');
    expect(source).not.toContain('toast.');
    expect(source).not.toContain('Close');
  });
});
