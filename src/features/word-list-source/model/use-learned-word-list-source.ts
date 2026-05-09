import { fetchMockLearnedUnitProgressPage } from '@/entities/learning-unit-progress/api/mock-unit-progress-repository';

import type { WordListSourceOptions, WordListSourceResult } from './types';
import { usePagedWordListSource } from './use-paged-word-list-source';
import { WORD_LIST_SOURCE_QUERY_KEYS } from './word-list-query';

export function useLearnedWordListSource(
  options: WordListSourceOptions = {}
): WordListSourceResult {
  return usePagedWordListSource({
    queryKey: WORD_LIST_SOURCE_QUERY_KEYS.learned,
    enabled: options.enabled ?? true,
    fetchPage: fetchMockLearnedUnitProgressPage,
    appendErrorTitle: '加载更多单词失败',
  });
}
