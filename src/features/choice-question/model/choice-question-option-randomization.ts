import type {
  ChoiceQuestionData,
  ChoiceQuestionOption,
} from './types';

type RandomSource = () => number;

export function shuffleChoiceQuestionOptions(
  options: ChoiceQuestionOption[],
  random: RandomSource = Math.random
) {
  const shuffledOptions = [...options];

  for (let index = shuffledOptions.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const option = shuffledOptions[index];

    shuffledOptions[index] = shuffledOptions[swapIndex];
    shuffledOptions[swapIndex] = option;
  }

  return shuffledOptions;
}

export function createChoiceQuestionDisplayQuestions(
  questions: ChoiceQuestionData[],
  random: RandomSource = Math.random
) {
  return questions.map((question) => ({
    ...question,
    options: shuffleChoiceQuestionOptions(question.options, random),
  }));
}
