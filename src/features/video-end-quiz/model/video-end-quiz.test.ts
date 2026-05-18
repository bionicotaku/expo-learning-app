import { QueryClient } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { EndQuiz } from '@/entities/end-quiz';
import type { VideoListItem } from '@/entities/video';
import { ApiError } from '@/shared/api';
import { toast } from '@/shared/lib/toast';

import {
  createVideoEndQuizController,
  getEndQuizQueryKey,
  isRetryableEndQuizFailure,
  loadEndQuizForVideo,
  mapEndQuizToChoiceQuestionSetData,
} from './video-end-quiz';

const { fetchEndQuizMock } = vi.hoisted(() => ({
  fetchEndQuizMock: vi.fn(),
}));

vi.mock('@/entities/end-quiz', () => ({
  fetchEndQuiz: fetchEndQuizMock,
}));

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

function createVideoItem(
  overrides: Partial<VideoListItem> = {}
): VideoListItem {
  return {
    coverImageUrl: null,
    description: 'desc',
    durationSeconds: 30,
    favoriteCount: 0,
    likeCount: 0,
    recommendationRunId: '00000000-0000-4000-8000-000000000000',
    learningUnits: [
      {
        coarseUnitId: 138446,
        text: 'sacred',
        role: 'new_now',
        isPrimary: true,
        evidenceSentenceIndex: 1,
        evidenceSpanIndex: 2,
        evidenceStartMs: 1000,
        evidenceEndMs: 2000,
      },
      {
        coarseUnitId: 37192,
        text: 'acupuncture',
        role: 'soft_review',
        isPrimary: false,
        evidenceSentenceIndex: 3,
        evidenceSpanIndex: 4,
        evidenceStartMs: 3000,
        evidenceEndMs: 4000,
      },
    ],
    title: 'Video',
    videoId: '00000000-0000-4000-8000-000000000001',
    videoUrl: 'https://example.com/video.m3u8',
    viewCount: 0,
    ...overrides,
  };
}

function createEndQuiz(items: EndQuiz['items']): EndQuiz {
  return {
    videoId: '00000000-0000-4000-8000-000000000001',
    items,
    missingCoarseUnitIds: [],
  };
}

const sacredQuestion: EndQuiz['items'][number] = {
  coarseUnitId: 138446,
  questionId: '00000000-0000-4000-8000-001000138446',
  source: 'video_context',
  questionType: 'context_meaning_choice',
  targetText: 'sacred',
  question: "说话人说的 'sacred' 在这里最接近哪个意思？",
  contextText:
    'The most sacred thing I do is care and provide for my workers, my family.',
  options: [
    { optionId: 'correct', text: '最重要、不可轻视的' },
    { optionId: 'wrong_1', text: '赚大钱的、有利可图的' },
  ],
  explanation: null,
  contextSentenceIndex: 14,
  contextSpanIndex: 17,
  contextStartMs: 17621,
  contextEndMs: 30899,
};

describe('video end quiz feature', () => {
  let queryClient: QueryClient;
  let toastSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.restoreAllMocks();
    fetchEndQuizMock.mockReset();
    queryClient = createQueryClient();
    toast.clear();
    toastSpy = vi.spyOn(toast, 'show');
  });

  it('uses a stable query key without recommendation run id', () => {
    const item = createVideoItem({
      recommendationRunId: '00000000-0000-4000-8000-999999999999',
      learningUnits: [
        createVideoItem().learningUnits[0]!,
        createVideoItem().learningUnits[0]!,
        {
          ...createVideoItem().learningUnits[1]!,
          coarseUnitId: 0,
        },
        createVideoItem().learningUnits[1]!,
      ],
    });

    expect(getEndQuizQueryKey(item)).toEqual([
      'end-quiz',
      '00000000-0000-4000-8000-000000000001',
      138446,
      37192,
    ]);
  });

  it('uses cached questions only when cached items are non-empty', async () => {
    const item = createVideoItem();
    const cached = createEndQuiz([sacredQuestion]);
    queryClient.setQueryData(getEndQuizQueryKey(item), cached);

    await expect(loadEndQuizForVideo(queryClient, item)).resolves.toBe(cached);
    expect(fetchEndQuizMock).not.toHaveBeenCalled();

    queryClient.setQueryData(getEndQuizQueryKey(item), createEndQuiz([]));
    fetchEndQuizMock.mockResolvedValueOnce(createEndQuiz([sacredQuestion]));

    await expect(loadEndQuizForVideo(queryClient, item)).resolves.toEqual(
      createEndQuiz([sacredQuestion])
    );
    expect(fetchEndQuizMock).toHaveBeenCalledTimes(1);
  });

  it('passes video id, deduped unit ids, recommendation run id, and signal to the repository', async () => {
    const item = createVideoItem({
      learningUnits: [
        createVideoItem().learningUnits[0]!,
        createVideoItem().learningUnits[0]!,
        createVideoItem().learningUnits[1]!,
      ],
    });
    fetchEndQuizMock.mockResolvedValueOnce(createEndQuiz([]));

    await loadEndQuizForVideo(queryClient, item);

    expect(fetchEndQuizMock).toHaveBeenCalledWith({
      videoId: item.videoId,
      coarseUnitIds: [138446, 37192],
      recommendationRunId: item.recommendationRunId,
      signal: expect.any(AbortSignal),
    });
  });

  it('retries only retryable API errors up to two times', () => {
    expect(
      isRetryableEndQuizFailure(
        0,
        new ApiError('timeout', { retryable: true })
      )
    ).toBe(true);
    expect(
      isRetryableEndQuizFailure(
        1,
        new ApiError('timeout', { retryable: true })
      )
    ).toBe(true);
    expect(
      isRetryableEndQuizFailure(
        2,
        new ApiError('timeout', { retryable: true })
      )
    ).toBe(false);
    expect(
      isRetryableEndQuizFailure(
        0,
        new ApiError('bad request', { retryable: false })
      )
    ).toBe(false);
  });

  it('maps end quiz questions to choice question set data with answer detail fallback', () => {
    expect(mapEndQuizToChoiceQuestionSetData(createEndQuiz([sacredQuestion]))).toEqual({
      showProgress: true,
      questions: [
        {
          id: '00000000-0000-4000-8000-001000138446',
          kind: 'context_meaning',
          title: 'sacred',
          prompt: "说话人说的 'sacred' 在这里最接近哪个意思？",
          contextText:
            'The most sacred thing I do is care and provide for my workers, my family.',
          targetText: 'sacred',
          options: [
            {
              id: 'correct',
              label: '最重要、不可轻视的',
              isCorrect: true,
            },
            {
              id: 'wrong_1',
              label: '赚大钱的、有利可图的',
              isCorrect: false,
            },
          ],
          answerDetail: {
            label: 'sacred',
            pos: '',
            chineseLabel: '最重要、不可轻视的',
            explanation: '已选择正确答案。',
          },
        },
      ],
    });
  });

  it('skips malformed questions without a correct option', () => {
    expect(
      mapEndQuizToChoiceQuestionSetData(
        createEndQuiz([
          {
            ...sacredQuestion,
            options: [{ optionId: 'wrong_1', text: '错误项' }],
          },
        ])
      )
    ).toEqual({
      showProgress: false,
      questions: [],
    });
  });

  it('shows a single toast when prefetch fully fails and no toast for empty results', async () => {
    const item = createVideoItem();
    fetchEndQuizMock.mockRejectedValueOnce(
      new ApiError('bad request', { retryable: false })
    );
    const controller = createVideoEndQuizController({
      queryClient,
      presentChoiceQuestionSetDialogAndWait: vi.fn(),
    });

    await controller.prefetchEndQuizForVideo(item);

    expect(toastSpy).toHaveBeenCalledWith({
      kind: 'error',
      title: '题目加载失败',
    });

    toastSpy.mockClear();
    fetchEndQuizMock.mockResolvedValueOnce(createEndQuiz([]));

    await controller.prefetchEndQuizForVideo(item);

    expect(toastSpy).not.toHaveBeenCalled();
  });

  it('does not toast prefetch failures when the failure guard returns false', async () => {
    const item = createVideoItem();
    fetchEndQuizMock.mockRejectedValueOnce(
      new ApiError('bad request', { retryable: false })
    );
    const controller = createVideoEndQuizController({
      queryClient,
      presentChoiceQuestionSetDialogAndWait: vi.fn(),
    });

    await controller.prefetchEndQuizForVideo(item, {
      shouldToastFailure: () => false,
    });

    expect(toastSpy).not.toHaveBeenCalled();
  });

  it('presents mapped questions before advance and skips empty or failed data', async () => {
    const presentChoiceQuestionSetDialogAndWait = vi.fn().mockResolvedValue(true);
    const controller = createVideoEndQuizController({
      queryClient,
      presentChoiceQuestionSetDialogAndWait,
    });
    fetchEndQuizMock.mockResolvedValueOnce(createEndQuiz([sacredQuestion]));

    await controller.presentEndQuizBeforeAdvance(createVideoItem());

    expect(presentChoiceQuestionSetDialogAndWait).toHaveBeenCalledWith(
      expect.objectContaining({
        questions: expect.arrayContaining([
          expect.objectContaining({
            id: sacredQuestion.questionId,
          }),
        ]),
      })
    );

    presentChoiceQuestionSetDialogAndWait.mockClear();
    queryClient.clear();
    fetchEndQuizMock.mockResolvedValueOnce(createEndQuiz([]));

    await controller.presentEndQuizBeforeAdvance(createVideoItem());

    expect(presentChoiceQuestionSetDialogAndWait).not.toHaveBeenCalled();
  });
});
