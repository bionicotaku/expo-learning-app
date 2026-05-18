import { describe, expect, it } from 'vitest';

import type { ChoiceQuestionData } from './types';
import {
  createChoiceQuestionDisplayQuestions,
  shuffleChoiceQuestionOptions,
} from './choice-question-option-randomization';

const question: ChoiceQuestionData = {
  id: 'context-meaning',
  kind: 'context_meaning',
  title: 'barely',
  prompt: '这里的 “barely” 最接近什么意思？',
  options: [
    {
      id: 'correct',
      label: '几乎不 / 勉强',
      isCorrect: true,
    },
    {
      id: 'wrong-1',
      label: '非常快',
      isCorrect: false,
    },
    {
      id: 'wrong-2',
      label: '提前',
      isCorrect: false,
    },
  ],
};

describe('choice question option randomization', () => {
  it('shuffles option display order without mutating the source options', () => {
    const shuffledOptions = shuffleChoiceQuestionOptions(
      question.options,
      () => 0
    );

    expect(shuffledOptions.map((option) => option.id)).toEqual([
      'wrong-1',
      'wrong-2',
      'correct',
    ]);
    expect(question.options.map((option) => option.id)).toEqual([
      'correct',
      'wrong-1',
      'wrong-2',
    ]);
    expect(shuffledOptions).not.toBe(question.options);
  });

  it('creates display questions with shuffled options while preserving question fields', () => {
    const displayQuestions = createChoiceQuestionDisplayQuestions(
      [question],
      () => 0
    );

    expect(displayQuestions).toHaveLength(1);
    expect(displayQuestions[0]).toMatchObject({
      id: question.id,
      kind: question.kind,
      title: question.title,
      prompt: question.prompt,
    });
    expect(displayQuestions[0].options.map((option) => option.id)).toEqual([
      'wrong-1',
      'wrong-2',
      'correct',
    ]);
    expect(displayQuestions[0]).not.toBe(question);
    expect(displayQuestions[0].options).not.toBe(question.options);
  });
});
