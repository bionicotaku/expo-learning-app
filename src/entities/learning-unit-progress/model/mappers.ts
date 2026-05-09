import type {
  LearningUnitProgressItemDto,
  LearningUnitProgressPageDto,
} from './dto';
import type {
  LearningUnitProgressItem,
  LearningUnitProgressPage,
} from './types';

function normalizePartOfSpeech(pos: string | null): string | null {
  return pos === '' ? null : pos;
}

export function mapLearningUnitProgressItemDtoToDomain(
  item: LearningUnitProgressItemDto
): LearningUnitProgressItem {
  return {
    coarseUnitId: item.coarse_unit_id,
    kind: item.kind,
    label: item.label,
    partOfSpeech: normalizePartOfSpeech(item.pos),
    chineseLabel: item.chinese_label,
    chineseDefinition: item.chinese_def,
    progressPercent: item.progress_percent,
    lastReviewedAt: item.last_reviewed_at,
  };
}

export function mapLearningUnitProgressPageDtoToDomain(
  dto: LearningUnitProgressPageDto
): LearningUnitProgressPage {
  return {
    items: dto.items.map(mapLearningUnitProgressItemDtoToDomain),
    page: {
      limit: dto.page.limit,
      hasMore: dto.page.has_more,
      nextCursor: dto.page.next_cursor,
    },
  };
}
