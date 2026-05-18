import { fetchMockEndQuiz } from './mock-end-quiz-repository';
import type { FetchEndQuizInput } from '../model/types';

export function fetchEndQuiz(input: FetchEndQuizInput) {
  return fetchMockEndQuiz(input);
}
