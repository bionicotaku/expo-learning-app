import type { LearningUnitProgressItem } from '@/entities/learning-unit-progress';

import type { WordListSourceItem } from './types';

export function mapLearningUnitProgressItemToWordListSourceItem(
  item: LearningUnitProgressItem
): WordListSourceItem {
  return {
    id: String(item.coarseUnitId),
    coarseUnitId: item.coarseUnitId,
    label: item.label,
    partOfSpeech: item.partOfSpeech,
    chineseLabel: item.chineseLabel ?? '',
    chineseDefinition: item.chineseDefinition ?? '',
    progress: item.progressPercent,
  };
}
