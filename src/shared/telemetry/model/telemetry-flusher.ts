import type {
  TelemetryFlushResult,
  TelemetryQueue,
  TelemetryRetryPolicy,
  TelemetrySender,
} from './types';

export const DEFAULT_TELEMETRY_FLUSH_CONCURRENCY = 3;
export const DEFAULT_TELEMETRY_FLUSH_MAX_ITEMS = 20;
export const DEFAULT_TELEMETRY_MAX_ATTEMPTS = 5;
export const DEFAULT_TELEMETRY_BASE_RETRY_DELAY_MS = 5_000;
export const DEFAULT_TELEMETRY_MAX_RETRY_DELAY_MS = 60_000;

type FlushTelemetryQueueOptions<TPayload> = Partial<TelemetryRetryPolicy> & {
  concurrency?: number;
  maxItemsPerFlush?: number;
  nowMs?: number;
  sender: TelemetrySender<TPayload>;
};

const activeFlushQueues = new WeakSet<TelemetryQueue<unknown>>();

function normalizePositiveInteger(value: number | undefined, fallback: number) {
  if (!Number.isFinite(value) || value === undefined) {
    return fallback;
  }

  return Math.max(1, Math.floor(value));
}

async function runWithConcurrency<TItem>({
  concurrency,
  items,
  worker,
}: {
  concurrency: number;
  items: TItem[];
  worker: (item: TItem) => Promise<void>;
}) {
  let nextIndex = 0;

  const runners = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (nextIndex < items.length) {
        const item = items[nextIndex];
        nextIndex += 1;
        await worker(item);
      }
    }
  );

  await Promise.all(runners);
}

export async function flushTelemetryQueue<TPayload>(
  queue: TelemetryQueue<TPayload>,
  {
    baseRetryDelayMs = DEFAULT_TELEMETRY_BASE_RETRY_DELAY_MS,
    concurrency = DEFAULT_TELEMETRY_FLUSH_CONCURRENCY,
    maxAttempts = DEFAULT_TELEMETRY_MAX_ATTEMPTS,
    maxItemsPerFlush = DEFAULT_TELEMETRY_FLUSH_MAX_ITEMS,
    maxRetryDelayMs = DEFAULT_TELEMETRY_MAX_RETRY_DELAY_MS,
    nowMs = Date.now(),
    sender,
  }: FlushTelemetryQueueOptions<TPayload>
): Promise<TelemetryFlushResult> {
  const queueKey = queue as TelemetryQueue<unknown>;
  if (activeFlushQueues.has(queueKey)) {
    return {
      droppedCount: queue.getSnapshot().droppedCount,
      failedCount: 0,
      skipped: true,
      sentCount: 0,
    };
  }

  activeFlushQueues.add(queueKey);

  try {
    const items = queue.getFlushableItems(
      nowMs,
      normalizePositiveInteger(maxItemsPerFlush, DEFAULT_TELEMETRY_FLUSH_MAX_ITEMS)
    );
    let failedCount = 0;
    let sentCount = 0;
    const retryPolicy: TelemetryRetryPolicy = {
      baseRetryDelayMs,
      maxAttempts,
      maxRetryDelayMs,
    };

    await runWithConcurrency({
      concurrency: normalizePositiveInteger(
        concurrency,
        DEFAULT_TELEMETRY_FLUSH_CONCURRENCY
      ),
      items,
      worker: async (item) => {
        try {
          await sender(item);
          queue.markSucceeded([item.id]);
          sentCount += 1;
        } catch (error) {
          queue.markFailed(item.id, error, nowMs, retryPolicy);
          failedCount += 1;
        }
      },
    });

    return {
      droppedCount: queue.getSnapshot().droppedCount,
      failedCount,
      skipped: false,
      sentCount,
    };
  } finally {
    activeFlushQueues.delete(queueKey);
  }
}
