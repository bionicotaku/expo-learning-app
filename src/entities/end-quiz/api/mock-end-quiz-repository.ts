import { resolveMockClipAssetByVideoId } from '@/entities/video/model/mock-clip-catalog';

import { mapEndQuizResponseToEndQuiz } from '../model/mappers';
import type {
  EndQuiz,
  EndQuizItem,
  EndQuizResponse,
  FetchEndQuizInput,
} from '../model/types';
import { mockEndQuizQuestionsByClipNumber } from './mock-end-quiz-question-data';

function normalizeCoarseUnitIds(coarseUnitIds: number[]) {
  const seen = new Set<number>();
  const nextIds: number[] = [];

  for (const coarseUnitId of coarseUnitIds) {
    if (
      !Number.isSafeInteger(coarseUnitId) ||
      coarseUnitId <= 0 ||
      seen.has(coarseUnitId)
    ) {
      continue;
    }

    seen.add(coarseUnitId);
    nextIds.push(coarseUnitId);
  }

  return nextIds;
}

function cloneEndQuizItem(item: EndQuizItem): EndQuizItem {
  return {
    ...item,
    options: item.options.map((option) => ({ ...option })),
  };
}

export function createMockEndQuizResponse({
  videoId,
  coarseUnitIds,
}: Pick<FetchEndQuizInput, 'videoId' | 'coarseUnitIds'>): EndQuizResponse {
  const requestedIds = normalizeCoarseUnitIds(coarseUnitIds);
  const asset = resolveMockClipAssetByVideoId(videoId);
  const questions =
    asset === null ? [] : (mockEndQuizQuestionsByClipNumber[asset.clipNumber] ?? []);
  const questionsByUnitId = new Map(
    questions.map((question) => [question.coarse_unit_id, question])
  );
  const items: EndQuizItem[] = [];
  const missingCoarseUnitIds: number[] = [];

  for (const coarseUnitId of requestedIds) {
    const question = questionsByUnitId.get(coarseUnitId);

    if (!question) {
      missingCoarseUnitIds.push(coarseUnitId);
      continue;
    }

    items.push(cloneEndQuizItem(question));
  }

  return {
    video_id: videoId,
    items,
    missing_coarse_unit_ids: missingCoarseUnitIds,
  };
}

export async function fetchMockEndQuiz(
  input: FetchEndQuizInput
): Promise<EndQuiz> {
  const response = createMockEndQuizResponse(input);

  return mapEndQuizResponseToEndQuiz(response);
}
