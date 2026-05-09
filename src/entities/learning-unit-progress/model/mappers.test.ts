import { describe, expect, it } from 'vitest';

import { mapLearningUnitProgressPageDtoToDomain } from './mappers';

describe('learning unit progress dto mappers', () => {
  it('maps snake_case transport fields into camelCase domain fields', () => {
    expect(
      mapLearningUnitProgressPageDtoToDomain({
        items: [
          {
            coarse_unit_id: 101,
            kind: 'word',
            label: 'abandon',
            pos: 'verb',
            chinese_label: '放弃；抛弃',
            chinese_def: '表示放弃某事物、抛弃某人或中止某计划。',
            progress_percent: 64.25,
            last_reviewed_at: '2026-05-08T09:20:00Z',
          },
        ],
        page: {
          limit: 50,
          has_more: true,
          next_cursor: 'opaque-token',
        },
      })
    ).toEqual({
      items: [
        {
          coarseUnitId: 101,
          kind: 'word',
          label: 'abandon',
          partOfSpeech: 'verb',
          chineseLabel: '放弃；抛弃',
          chineseDefinition: '表示放弃某事物、抛弃某人或中止某计划。',
          progressPercent: 64.25,
          lastReviewedAt: '2026-05-08T09:20:00Z',
        },
      ],
      page: {
        limit: 50,
        hasMore: true,
        nextCursor: 'opaque-token',
      },
    });
  });

  it('normalizes empty and null part-of-speech values to null', () => {
    expect(
      mapLearningUnitProgressPageDtoToDomain({
        items: [
          {
            coarse_unit_id: 101,
            kind: 'word',
            label: 'abandon',
            pos: '',
            chinese_label: null,
            chinese_def: null,
            progress_percent: 0,
            last_reviewed_at: null,
          },
          {
            coarse_unit_id: 102,
            kind: 'phrase',
            label: 'carry weight',
            pos: null,
            chinese_label: null,
            chinese_def: null,
            progress_percent: 12.5,
            last_reviewed_at: null,
          },
        ],
        page: {
          limit: 2,
          has_more: false,
          next_cursor: null,
        },
      }).items.map((item) => item.partOfSpeech)
    ).toEqual([null, null]);
  });
});
