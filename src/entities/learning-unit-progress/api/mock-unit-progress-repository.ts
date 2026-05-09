import type { LearningUnitProgressPage } from '../model/types';

type FetchMockUnlearnedUnitProgressPageOptions = {
  limit?: number;
  cursor?: string;
  signal?: AbortSignal;
  delayMs?: number;
};

const DEFAULT_MOCK_UNLEARNED_LIMIT = 24;
const DEFAULT_MOCK_LEARNED_LIMIT = 24;
const MOCK_LEARNED_CURSOR_PREFIX = 'mock-learned-page:';
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

const mockLearnedUnitPool = [
  {
    label: 'anchor',
    partOfSpeech: 'noun',
    chineseLabel: '锚；固定点',
    chineseDefinition: '表示锚，或让事物稳定下来的关键点。',
  },
  {
    label: 'clarify',
    partOfSpeech: 'verb',
    chineseLabel: '澄清；说明',
    chineseDefinition: '把含糊的信息解释清楚，使意思更明确。',
  },
  {
    label: 'durable',
    partOfSpeech: 'adjective',
    chineseLabel: '耐用的；持久的',
    chineseDefinition: '能够长时间保持功能或效果，不容易损坏或消失。',
  },
  {
    label: 'efficiently',
    partOfSpeech: 'adverb',
    chineseLabel: '高效地',
    chineseDefinition: '以较少时间、资源或精力完成目标。',
  },
  {
    label: 'estimate',
    partOfSpeech: 'verb',
    chineseLabel: '估计；估算',
    chineseDefinition: '基于已有信息对数量、时间或结果作出近似判断。',
  },
  {
    label: 'flexible',
    partOfSpeech: 'adjective',
    chineseLabel: '灵活的',
    chineseDefinition: '能够根据情况变化调整方式、计划或结构。',
  },
  {
    label: 'foundation',
    partOfSpeech: 'noun',
    chineseLabel: '基础；根基',
    chineseDefinition: '支撑某个体系、观点或建筑的底层部分。',
  },
  {
    label: 'maintain',
    partOfSpeech: 'verb',
    chineseLabel: '维持；维护',
    chineseDefinition: '让某种状态、关系或系统持续保持正常。',
  },
  {
    label: 'observe',
    partOfSpeech: 'verb',
    chineseLabel: '观察；遵守',
    chineseDefinition: '仔细看或注意某事，也可表示遵守规则。',
  },
  {
    label: 'primary',
    partOfSpeech: 'adjective',
    chineseLabel: '主要的；首要的',
    chineseDefinition: '在重要性、顺序或作用上处于最前的位置。',
  },
  {
    label: 'reliable',
    partOfSpeech: 'adjective',
    chineseLabel: '可靠的',
    chineseDefinition: '可以信任，通常能稳定地产生预期结果。',
  },
  {
    label: 'strategy',
    partOfSpeech: 'noun',
    chineseLabel: '策略',
    chineseDefinition: '为达成长期目标而制定的一套方法或安排。',
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

function resolveLearnedPageIndex(cursor?: string) {
  if (!cursor || !cursor.startsWith(MOCK_LEARNED_CURSOR_PREFIX)) {
    return 0;
  }

  const pageIndex = Number.parseInt(cursor.slice(MOCK_LEARNED_CURSOR_PREFIX.length), 10);
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

function createMockLearnedItem(itemIndex: number): LearningUnitProgressPage['items'][number] {
  const poolItem = mockLearnedUnitPool[itemIndex % mockLearnedUnitPool.length];
  const coarseUnitId = 10001 + itemIndex;
  const cycle = Math.floor(itemIndex / mockLearnedUnitPool.length);

  return {
    coarseUnitId,
    kind: 'word',
    label: cycle === 0 ? poolItem.label : `${poolItem.label} ${cycle + 1}`,
    partOfSpeech: poolItem.partOfSpeech,
    chineseLabel: poolItem.chineseLabel,
    chineseDefinition: poolItem.chineseDefinition,
    progressPercent: 100,
    lastReviewedAt: '2026-05-08T09:20:00Z',
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

export async function fetchMockLearnedUnitProgressPage({
  limit = DEFAULT_MOCK_LEARNED_LIMIT,
  cursor,
  signal,
  delayMs = 1500,
}: FetchMockUnlearnedUnitProgressPageOptions = {}): Promise<LearningUnitProgressPage> {
  const pageIndex = resolveLearnedPageIndex(cursor);
  const pageStart = pageIndex * limit;

  await sleep(delayMs, signal);

  return {
    items: Array.from({ length: limit }, (_, index) =>
      createMockLearnedItem(pageStart + index)
    ),
    page: {
      limit,
      hasMore: true,
      nextCursor: `${MOCK_LEARNED_CURSOR_PREFIX}${pageIndex + 1}`,
    },
  };
}

export function resetMockUnlearnedUnitProgress() {
  // The mock is cursor-derived and stateless; this keeps tests aligned with other mock repositories.
}

export function resetMockLearnedUnitProgress() {
  // The mock is cursor-derived and stateless; this keeps tests aligned with other mock repositories.
}
