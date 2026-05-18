import type { QueryClient } from '@tanstack/react-query';

import { fetchEndQuiz, type EndQuiz } from '@/entities/end-quiz';
import type { VideoListItem } from '@/entities/video';
import {
  type ChoiceQuestionData,
  type ChoiceQuestionKind,
  type ChoiceQuestionSetDialogData,
} from '@/features/choice-question';
import { ApiError } from '@/shared/api';
import { toast } from '@/shared/lib/toast';

const endQuizCacheGcMs = 30 * 60 * 1000;
const endQuizFailureToastTitle = '题目加载失败';

export function getEndQuizCoarseUnitIds(item: VideoListItem) {
  const seen = new Set<number>();
  const coarseUnitIds: number[] = [];

  for (const learningUnit of item.learningUnits) {
    const coarseUnitId = learningUnit.coarseUnitId;
    if (
      !Number.isSafeInteger(coarseUnitId) ||
      coarseUnitId <= 0 ||
      seen.has(coarseUnitId)
    ) {
      continue;
    }

    seen.add(coarseUnitId);
    coarseUnitIds.push(coarseUnitId);
  }

  return coarseUnitIds;
}

export function getEndQuizQueryKey(item: VideoListItem) {
  return ['end-quiz', item.videoId, ...getEndQuizCoarseUnitIds(item)] as const;
}

export function isRetryableEndQuizFailure(failureCount: number, error: unknown) {
  if (failureCount >= 2) {
    return false;
  }

  return error instanceof ApiError && error.retryable;
}

function shouldShowEndQuizFailureToast(error: unknown) {
  return !(error instanceof ApiError && error.code === 'REQUEST_ABORTED');
}

function createEmptyEndQuiz(videoId: string): EndQuiz {
  return {
    videoId,
    items: [],
    missingCoarseUnitIds: [],
  };
}

export async function loadEndQuizForVideo(
  queryClient: QueryClient,
  item: VideoListItem
) {
  const queryKey = getEndQuizQueryKey(item);
  const cached = queryClient.getQueryData<EndQuiz>(queryKey);

  if (cached && cached.items.length > 0) {
    return cached;
  }

  const coarseUnitIds = getEndQuizCoarseUnitIds(item);
  if (coarseUnitIds.length === 0) {
    return createEmptyEndQuiz(item.videoId);
  }

  return queryClient.fetchQuery({
    queryKey,
    queryFn: ({ signal }) =>
      fetchEndQuiz({
        videoId: item.videoId,
        coarseUnitIds,
        recommendationRunId: item.recommendationRunId,
        signal,
      }),
    staleTime: 0,
    gcTime: endQuizCacheGcMs,
    retry: isRetryableEndQuizFailure,
  });
}

const questionKindByType = {
  context_meaning_choice: 'context_meaning',
  context_cloze_choice: 'context_cloze',
  unit_meaning_choice: 'general_meaning',
  reverse_identification_choice: 'reverse_recognition',
} satisfies Record<EndQuiz['items'][number]['questionType'], ChoiceQuestionKind>;

function resolveChoiceQuestionTitle(question: EndQuiz['items'][number]) {
  if (
    question.questionType === 'context_meaning_choice' ||
    question.questionType === 'unit_meaning_choice'
  ) {
    return question.targetText;
  }

  return undefined;
}

function mapEndQuizQuestionToChoiceQuestion(
  question: EndQuiz['items'][number]
): ChoiceQuestionData | null {
  const correctOption = question.options.find(
    (option) => option.optionId === 'correct'
  );

  if (!correctOption) {
    return null;
  }

  return {
    id: question.questionId,
    kind: questionKindByType[question.questionType],
    title: resolveChoiceQuestionTitle(question),
    prompt: question.question,
    contextText: question.contextText ?? undefined,
    targetText: question.targetText,
    answerDetail: {
      label: question.targetText,
      pos: '',
      chineseLabel: correctOption.text,
      explanation: question.explanation ?? '已选择正确答案。',
    },
    options: question.options.map((option) => ({
      id: option.optionId,
      label: option.text,
      isCorrect: option.optionId === 'correct',
    })),
  };
}

export function mapEndQuizToChoiceQuestionSetData(
  endQuiz: EndQuiz
): ChoiceQuestionSetDialogData {
  const questions = endQuiz.items.flatMap((question) => {
    const mappedQuestion = mapEndQuizQuestionToChoiceQuestion(question);
    return mappedQuestion ? [mappedQuestion] : [];
  });

  return {
    questions,
    showProgress: questions.length > 0,
  };
}

type VideoEndQuizControllerOptions = {
  queryClient: QueryClient;
  presentChoiceQuestionSetDialogAndWait: (
    payload: ChoiceQuestionSetDialogData
  ) => Promise<boolean>;
};

export type PrefetchEndQuizOptions = {
  shouldToastFailure?: () => boolean;
};

export function createVideoEndQuizController({
  queryClient,
  presentChoiceQuestionSetDialogAndWait,
}: VideoEndQuizControllerOptions) {
  const handleFailure = (
    error: unknown,
    options: PrefetchEndQuizOptions = {}
  ) => {
    if (!shouldShowEndQuizFailureToast(error)) {
      return;
    }

    if (options.shouldToastFailure && !options.shouldToastFailure()) {
      return;
    }

    toast.show({
      kind: 'error',
      title: endQuizFailureToastTitle,
    });
  };

  return {
    async prefetchEndQuizForVideo(
      item: VideoListItem,
      options: PrefetchEndQuizOptions = {}
    ) {
      try {
        await loadEndQuizForVideo(queryClient, item);
      } catch (error) {
        handleFailure(error, options);
      }
    },

    async presentEndQuizBeforeAdvance(item: VideoListItem) {
      let endQuiz: EndQuiz;

      try {
        endQuiz = await loadEndQuizForVideo(queryClient, item);
      } catch (error) {
        handleFailure(error);
        return;
      }

      if (endQuiz.items.length === 0) {
        return;
      }

      const payload = mapEndQuizToChoiceQuestionSetData(endQuiz);
      if (payload.questions.length === 0) {
        return;
      }

      await presentChoiceQuestionSetDialogAndWait(payload);
    },
  };
}
