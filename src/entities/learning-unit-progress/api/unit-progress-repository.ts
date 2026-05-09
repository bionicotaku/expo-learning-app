import { ApiError, requestJson } from '@/shared/api';

import type { LearningUnitProgressPageDto } from '../model/dto';
import { mapLearningUnitProgressPageDtoToDomain } from '../model/mappers';
import type {
  LearningUnitProgressPage,
  LearningUnitProgressPageParams,
} from '../model/types';

const DEFAULT_LEARNING_UNIT_PROGRESS_LIMIT = 50;
const MIN_LEARNING_UNIT_PROGRESS_LIMIT = 1;
const MAX_LEARNING_UNIT_PROGRESS_LIMIT = 100;

type LearningUnitProgressBucket = 'learned' | 'unlearned';

const learningUnitProgressPaths: Record<LearningUnitProgressBucket, string> = {
  learned: '/learning/unit-progress/mastered',
  unlearned: '/learning/unit-progress/unmastered',
};

function resolveLearningUnitProgressLimit(limit?: number) {
  const resolvedLimit = limit ?? DEFAULT_LEARNING_UNIT_PROGRESS_LIMIT;

  if (
    !Number.isInteger(resolvedLimit) ||
    resolvedLimit < MIN_LEARNING_UNIT_PROGRESS_LIMIT ||
    resolvedLimit > MAX_LEARNING_UNIT_PROGRESS_LIMIT
  ) {
    throw new ApiError('Learning unit progress limit must be an integer from 1 to 100', {
      code: 'LEARNING_UNIT_PROGRESS_INVALID_LIMIT',
      retryable: false,
      details: {
        limit: resolvedLimit,
      },
    });
  }

  return resolvedLimit;
}

async function fetchLearningUnitProgressPage(
  bucket: LearningUnitProgressBucket,
  params: LearningUnitProgressPageParams = {}
): Promise<LearningUnitProgressPage> {
  const limit = resolveLearningUnitProgressLimit(params.limit);
  const dto = await requestJson<LearningUnitProgressPageDto>({
    path: learningUnitProgressPaths[bucket],
    auth: 'required',
    query: {
      limit,
      cursor: params.cursor === '' ? undefined : params.cursor,
    },
    signal: params.signal,
  });

  return mapLearningUnitProgressPageDtoToDomain(dto);
}

export function fetchUnlearnedUnitProgressPage(
  params?: LearningUnitProgressPageParams
): Promise<LearningUnitProgressPage> {
  return fetchLearningUnitProgressPage('unlearned', params);
}

export function fetchLearnedUnitProgressPage(
  params?: LearningUnitProgressPageParams
): Promise<LearningUnitProgressPage> {
  return fetchLearningUnitProgressPage('learned', params);
}
