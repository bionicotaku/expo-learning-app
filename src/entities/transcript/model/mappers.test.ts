import { describe, expect, it } from 'vitest';

import { mapTranscriptDtoToDomain } from './mappers';

describe('transcript dto mappers', () => {
  it('maps transcript transport fields into camelCase domain fields', () => {
    expect(
      mapTranscriptDtoToDomain({
        sentences: [
          {
            end: 55615,
            explanation: '这是一句对 Pam 的呼唤或感叹，可译为“帕姆！”。',
            index: 0,
            start: 55260,
            text: 'Pam!',
            tokens: [
              {
                end: 55615,
                explanation: '人名 Pam 的呼唤/感叹：‘帕姆！’',
                index: 0,
                semantic_element: {
                  base_form: 'Pam',
                  coarse_id: null,
                  dictionary: '女性人名；帕姆',
                  reason: 'no coarse mapping',
                },
                start: 55260,
                text: 'Pam!',
              },
            ],
          },
        ],
      })
    ).toEqual({
      sentences: [
        {
          end: 55615,
          explanation: '这是一句对 Pam 的呼唤或感叹，可译为“帕姆！”。',
          index: 0,
          start: 55260,
          text: 'Pam!',
          tokens: [
            {
              end: 55615,
              explanation: '人名 Pam 的呼唤/感叹：‘帕姆！’',
              index: 0,
              semanticElement: {
                baseForm: 'Pam',
                coarseId: null,
                dictionary: '女性人名；帕姆',
                reason: 'no coarse mapping',
              },
              start: 55260,
              text: 'Pam!',
            },
          ],
        },
      ],
    });
  });
});
