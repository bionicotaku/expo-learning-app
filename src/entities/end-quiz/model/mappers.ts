import type {
  EndQuiz,
  EndQuizItem,
  EndQuizQuestion,
  EndQuizResponse,
} from './types';

function mapEndQuizItem(item: EndQuizItem): EndQuizQuestion {
  return {
    coarseUnitId: item.coarse_unit_id,
    questionId: item.question_id,
    source: item.source,
    questionType: item.question_type,
    targetText: item.target_text,
    question: item.question,
    contextText: item.context_text,
    options: item.options.map((option) => ({
      optionId: option.option_id,
      text: option.text,
    })),
    explanation: item.explanation,
    contextSentenceIndex: item.context_sentence_index,
    contextSpanIndex: item.context_span_index,
    contextStartMs: item.context_start_ms,
    contextEndMs: item.context_end_ms,
  };
}

export function mapEndQuizResponseToEndQuiz(response: EndQuizResponse): EndQuiz {
  return {
    videoId: response.video_id,
    items: response.items.map(mapEndQuizItem),
    missingCoarseUnitIds: [...response.missing_coarse_unit_ids],
  };
}
