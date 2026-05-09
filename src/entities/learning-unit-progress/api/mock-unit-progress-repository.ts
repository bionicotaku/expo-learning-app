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
  },
  {
    label: 'accurate',
    partOfSpeech: 'adjective',
    chineseLabel: '准确的',
  },
  {
    label: 'approach',
    partOfSpeech: 'noun',
    chineseLabel: '方法；途径',
  },
  {
    label: 'briefly',
    partOfSpeech: 'adverb',
    chineseLabel: '简短地',
  },
  {
    label: 'capture',
    partOfSpeech: 'verb',
    chineseLabel: '捕捉；记录',
  },
  {
    label: 'consistent',
    partOfSpeech: 'adjective',
    chineseLabel: '一致的',
  },
  {
    label: 'context',
    partOfSpeech: 'noun',
    chineseLabel: '语境',
  },
  {
    label: 'gradually',
    partOfSpeech: 'adverb',
    chineseLabel: '逐渐地',
  },
  {
    label: 'hesitate',
    partOfSpeech: 'verb',
    chineseLabel: '犹豫',
  },
  {
    label: 'precise',
    partOfSpeech: 'adjective',
    chineseLabel: '精确的',
  },
  {
    label: 'recover',
    partOfSpeech: 'verb',
    chineseLabel: '恢复',
  },
  {
    label: 'subtle',
    partOfSpeech: 'adjective',
    chineseLabel: '微妙的',
  },
  {
    label: 'tone',
    partOfSpeech: 'noun',
    chineseLabel: '语气',
  },
  {
    label: 'wander',
    partOfSpeech: 'verb',
    chineseLabel: '',
  },
  {
    label: 'while',
    partOfSpeech: null,
    chineseLabel: null,
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
    chineseDefinition: null,
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
