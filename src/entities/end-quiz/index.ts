export { fetchEndQuiz } from './api/end-quiz-repository';
export {
  createMockEndQuizResponse,
  fetchMockEndQuiz,
} from './api/mock-end-quiz-repository';
export { mapEndQuizResponseToEndQuiz } from './model/mappers';
export type {
  EndQuiz,
  EndQuizItem,
  EndQuizOption,
  EndQuizQuestion,
  EndQuizQuestionOption,
  EndQuizQuestionSource,
  EndQuizQuestionType,
  EndQuizResponse,
  FetchEndQuizInput,
} from './model/types';
