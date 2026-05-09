import type { LearningUnitProgressPage } from '../model/types';

type FetchMockUnlearnedUnitProgressPageOptions = {
  limit?: number;
  cursor?: string;
  signal?: AbortSignal;
  delayMs?: number;
};

const DEFAULT_MOCK_UNLEARNED_LIMIT = 24;
const MOCK_UNLEARNED_CURSOR_PREFIX = 'mock-unlearned-page:';

const mockUnlearnedUnitPool = [
  {
    label: 'abandon',
    partOfSpeech: 'verb',
    chineseLabel: '放弃；抛弃',
    chineseDefinition: '表示放弃某事物、抛弃某人或中止某计划。',
  },
  {
    label: 'accurate',
    partOfSpeech: 'adjective',
    chineseLabel: '准确的',
    chineseDefinition: '表示信息、判断或测量结果准确无误。',
  },
  {
    label: 'approach',
    partOfSpeech: 'noun',
    chineseLabel: '方法；途径',
    chineseDefinition: '处理问题、完成任务或接近目标的方法。',
  },
  {
    label: 'briefly',
    partOfSpeech: 'adverb',
    chineseLabel: '简短地',
    chineseDefinition: '用很少的时间或文字表达。',
  },
  {
    label: 'capture',
    partOfSpeech: 'verb',
    chineseLabel: '捕捉；记录',
    chineseDefinition: '抓住、捕获，或把信息记录下来。',
  },
  {
    label: 'consistent',
    partOfSpeech: 'adjective',
    chineseLabel: '一致的',
    chineseDefinition: '前后保持一致，没有明显冲突。',
  },
  {
    label: 'context',
    partOfSpeech: 'noun',
    chineseLabel: '语境',
    chineseDefinition: '理解词语、句子或事件所依赖的背景。',
  },
  {
    label: 'gradually',
    partOfSpeech: 'adverb',
    chineseLabel: '逐渐地',
    chineseDefinition: '以缓慢、连续的方式发生变化。',
  },
  {
    label: 'hesitate',
    partOfSpeech: 'verb',
    chineseLabel: '犹豫',
    chineseDefinition: '因不确定或缺乏信心而暂时不行动。',
  },
  {
    label: 'precise',
    partOfSpeech: 'adjective',
    chineseLabel: '精确的',
    chineseDefinition: '表达、测量或描述非常准确细致。',
  },
  {
    label: 'recover',
    partOfSpeech: 'verb',
    chineseLabel: '恢复',
    chineseDefinition: '从疾病、损失或异常状态中回到正常状态。',
  },
  {
    label: 'subtle',
    partOfSpeech: 'adjective',
    chineseLabel: '微妙的',
    chineseDefinition: '差别细小、不明显，但有重要含义。',
  },
  {
    label: 'tone',
    partOfSpeech: 'noun',
    chineseLabel: '语气',
    chineseDefinition: '说话、写作或表达中体现出的态度和情绪色彩。',
  },
  {
    label: 'wander',
    partOfSpeech: 'verb',
    chineseLabel: '',
    chineseDefinition: '',
  },
  {
    label: 'while',
    partOfSpeech: null,
    chineseLabel: null,
    chineseDefinition: '',
  },
] as const;

function sleep(delayMs: number, signal?: AbortSignal): Promise<void> {
  if (delayMs <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(resolve, delayMs);

    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timeout);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true }
    );
  });
}

function resolvePageIndex(cursor?: string) {
  if (!cursor || !cursor.startsWith(MOCK_UNLEARNED_CURSOR_PREFIX)) {
    return 0;
  }

  const pageIndex = Number.parseInt(cursor.slice(MOCK_UNLEARNED_CURSOR_PREFIX.length), 10);
  return Number.isFinite(pageIndex) && pageIndex >= 0 ? pageIndex : 0;
}

function createMockUnlearnedItem(itemIndex: number): LearningUnitProgressPage['items'][number] {
  const poolItem = mockUnlearnedUnitPool[itemIndex % mockUnlearnedUnitPool.length];
  const coarseUnitId = itemIndex + 1;
  const cycle = Math.floor(itemIndex / mockUnlearnedUnitPool.length);

  return {
    coarseUnitId,
    kind: 'word',
    label: cycle === 0 ? poolItem.label : `${poolItem.label} ${cycle + 1}`,
    partOfSpeech: poolItem.partOfSpeech,
    chineseLabel: poolItem.chineseLabel,
    chineseDefinition: poolItem.chineseDefinition,
    progressPercent: (coarseUnitId * 17) % 101,
    lastReviewedAt: null,
  };
}

export async function fetchMockUnlearnedUnitProgressPage({
  limit = DEFAULT_MOCK_UNLEARNED_LIMIT,
  cursor,
  signal,
  delayMs = 1500,
}: FetchMockUnlearnedUnitProgressPageOptions = {}): Promise<LearningUnitProgressPage> {
  const pageIndex = resolvePageIndex(cursor);
  const pageStart = pageIndex * limit;

  await sleep(delayMs, signal);

  return {
    items: Array.from({ length: limit }, (_, index) =>
      createMockUnlearnedItem(pageStart + index)
    ),
    page: {
      limit,
      hasMore: true,
      nextCursor: `${MOCK_UNLEARNED_CURSOR_PREFIX}${pageIndex + 1}`,
    },
  };
}

export function resetMockUnlearnedUnitProgress() {
  // The mock is cursor-derived and stateless; this keeps tests aligned with other mock repositories.
}
