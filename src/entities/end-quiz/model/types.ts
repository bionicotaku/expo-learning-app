export type EndQuizQuestionSource = 'video_context' | 'unit_generic';

export type EndQuizQuestionType =
  | 'context_meaning_choice'
  | 'context_cloze_choice'
  | 'unit_meaning_choice'
  | 'reverse_identification_choice';

export type EndQuizOption = {
  option_id: string;
  text: string;
};

export type EndQuizItem = {
  coarse_unit_id: number;
  question_id: string;
  source: EndQuizQuestionSource;
  question_type: EndQuizQuestionType;
  target_text: string;
  question: string;
  context_text: string | null;
  options: EndQuizOption[];
  explanation: string | null;
  context_sentence_index: number | null;
  context_span_index: number | null;
  context_start_ms: number | null;
  context_end_ms: number | null;
};

export type EndQuizResponse = {
  video_id: string;
  items: EndQuizItem[];
  missing_coarse_unit_ids: number[];
};

export type EndQuizQuestionOption = {
  optionId: string;
  text: string;
};

export type EndQuizQuestion = {
  coarseUnitId: number;
  questionId: string;
  source: EndQuizQuestionSource;
  questionType: EndQuizQuestionType;
  targetText: string;
  question: string;
  contextText: string | null;
  options: EndQuizQuestionOption[];
  explanation: string | null;
  contextSentenceIndex: number | null;
  contextSpanIndex: number | null;
  contextStartMs: number | null;
  contextEndMs: number | null;
};

export type EndQuiz = {
  videoId: string;
  items: EndQuizQuestion[];
  missingCoarseUnitIds: number[];
};

export type FetchEndQuizInput = {
  videoId: string;
  coarseUnitIds: number[];
  recommendationRunId?: string;
  signal?: AbortSignal;
};
