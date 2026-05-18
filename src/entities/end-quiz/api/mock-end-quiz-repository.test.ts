import { describe, expect, it } from 'vitest';

import { fetchEndQuiz } from './end-quiz-repository';
import { createMockEndQuizResponse } from './mock-end-quiz-repository';

describe('mock end quiz repository', () => {
  it('returns Office clip questions matching requested coarse unit ids', async () => {
    const response = await fetchEndQuiz({
      videoId: '00000000-0000-4000-8000-000000000001',
      coarseUnitIds: [89008, 138446, 37192, 109520],
      recommendationRunId: '00000000-0000-4000-8000-000000000000',
    });

    expect(response.videoId).toBe('00000000-0000-4000-8000-000000000001');
    expect(response.items.map((item) => item.coarseUnitId)).toEqual([
      138446,
      37192,
      109520,
    ]);
    expect(response.missingCoarseUnitIds).toEqual([89008]);
    expect(response.items[0]).toMatchObject({
      questionId: '00000000-0000-4000-8000-001000138446',
      source: 'video_context',
      questionType: 'context_meaning_choice',
      targetText: 'sacred',
      question: "说话人说的 'sacred' 在这里最接近哪个意思？",
      contextText:
        'The most sacred thing I do is care and provide for my workers, my family.',
      options: expect.arrayContaining([
        {
          optionId: 'correct',
          text: '最重要、不可轻视的',
        },
      ]),
      explanation: expect.stringContaining('sacred 本义'),
      contextSentenceIndex: 14,
      contextSpanIndex: 17,
      contextStartMs: 17621,
      contextEndMs: 30899,
    });
  });

  it('keeps mock response shape aligned with the backend API', () => {
    const response = createMockEndQuizResponse({
      videoId: '00000000-0000-4000-8000-000000000002',
      coarseUnitIds: [101652, 75647, 44429],
    });

    expect(response).toEqual({
      video_id: '00000000-0000-4000-8000-000000000002',
      items: expect.arrayContaining([
        expect.objectContaining({
          coarse_unit_id: 101652,
          question_id: '00000000-0000-4000-8000-002000101652',
          source: 'video_context',
          question_type: 'context_meaning_choice',
          target_text: 'job',
          question: expect.any(String),
          context_text: expect.any(String),
          options: expect.arrayContaining([
            {
              option_id: 'correct',
              text: '一份普通工作（仅为谋生）',
            },
          ]),
          explanation: expect.any(String),
          context_sentence_index: 47,
          context_span_index: 5,
          context_start_ms: 121996,
          context_end_ms: 123602,
        }),
      ]),
      missing_coarse_unit_ids: [44429],
    });
  });

  it('dedupes requested ids, ignores invalid ids, and returns empty without questions', async () => {
    await expect(
      fetchEndQuiz({
        videoId: '00000000-0000-4000-8000-000000000003',
        coarseUnitIds: [0, -1, 102119, 102119, 40985],
      })
    ).resolves.toMatchObject({
      items: [
        expect.objectContaining({
          coarseUnitId: 102119,
          targetText: 'Just',
        }),
      ],
      missingCoarseUnitIds: [40985],
    });

    await expect(
      fetchEndQuiz({
        videoId: '00000000-0000-4000-8000-000000000003',
        coarseUnitIds: [],
      })
    ).resolves.toEqual({
      videoId: '00000000-0000-4000-8000-000000000003',
      items: [],
      missingCoarseUnitIds: [],
    });
  });

  it('reuses the eight clip question sets for later mock feed batches', async () => {
    const firstClip = await fetchEndQuiz({
      videoId: '00000000-0000-4000-8000-000000000001',
      coarseUnitIds: [138446, 37192, 109520],
    });
    const ninthVideo = await fetchEndQuiz({
      videoId: '00000000-0000-4000-8000-000000000009',
      coarseUnitIds: [138446, 37192, 109520],
    });

    expect(ninthVideo.items).toEqual(firstClip.items);
  });

  it('covers all current Office clip mock questions', async () => {
    const expectedQuestionCountsByVideoId = new Map([
      ['00000000-0000-4000-8000-000000000001', 3],
      ['00000000-0000-4000-8000-000000000002', 2],
      ['00000000-0000-4000-8000-000000000003', 1],
      ['00000000-0000-4000-8000-000000000004', 1],
      ['00000000-0000-4000-8000-000000000005', 3],
      ['00000000-0000-4000-8000-000000000006', 1],
      ['00000000-0000-4000-8000-000000000007', 3],
      ['00000000-0000-4000-8000-000000000008', 1],
    ]);

    let totalQuestionCount = 0;
    for (const [videoId, expectedCount] of expectedQuestionCountsByVideoId) {
      const response = await fetchEndQuiz({
        videoId,
        coarseUnitIds: [
          138446,
          37192,
          109520,
          101652,
          75647,
          102119,
          115842,
          102680,
          35923,
          160022,
          136560,
          129008,
          164284,
          88656,
          157409,
        ],
      });

      totalQuestionCount += response.items.length;
      expect(response.items).toHaveLength(expectedCount);
    }

    expect(totalQuestionCount).toBe(15);
  });
});
