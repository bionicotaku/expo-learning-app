import { ApiError } from '@/shared/api';

import type {
  TelemetryPayloadMerge,
  TelemetryQueue,
  TelemetryQueueItem,
  TelemetryQueueItemInput,
  TelemetryQueueSnapshot,
  TelemetryRetryPolicy,
} from './types';

const defaultMaxSize = 100;

export type CreateInMemoryTelemetryQueueOptions = {
  maxSize?: number;
};

function normalizeQueueSize(maxSize: number | undefined): number {
  if (!Number.isFinite(maxSize) || maxSize === undefined) {
    return defaultMaxSize;
  }

  return Math.max(1, Math.floor(maxSize));
}

function normalizeItem<TPayload>(
  item: TelemetryQueueItemInput<TPayload>
): TelemetryQueueItem<TPayload> {
  return {
    ...item,
    attempts: item.attempts ?? 0,
    dedupeKey: item.dedupeKey ?? null,
    nextRetryAtMs: item.nextRetryAtMs ?? 0,
  };
}

function calculateNextRetryAtMs({
  attempts,
  nowMs,
  retryPolicy,
}: {
  attempts: number;
  nowMs: number;
  retryPolicy: TelemetryRetryPolicy;
}) {
  const delayMs = Math.min(
    retryPolicy.maxRetryDelayMs,
    retryPolicy.baseRetryDelayMs * 2 ** Math.max(0, attempts - 1)
  );

  return nowMs + delayMs;
}

function isRetryableTelemetryError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.retryable;
  }

  return true;
}

export function createInMemoryTelemetryQueue<TPayload = unknown>({
  maxSize,
}: CreateInMemoryTelemetryQueueOptions = {}): TelemetryQueue<TPayload> {
  const resolvedMaxSize = normalizeQueueSize(maxSize);
  let droppedCount = 0;
  let items: TelemetryQueueItem<TPayload>[] = [];

  function enforceMaxSize() {
    while (items.length > resolvedMaxSize) {
      items.shift();
      droppedCount += 1;
    }
  }

  function enqueueItem(item: TelemetryQueueItemInput<TPayload>) {
    const normalizedItem = normalizeItem(item);
    items = [...items, normalizedItem];
    enforceMaxSize();
    return normalizedItem;
  }

  return {
    clear() {
      items = [];
      droppedCount = 0;
    },
    enqueue(item) {
      return enqueueItem(item);
    },
    getFlushableItems(nowMs, limit) {
      if (limit <= 0) {
        return [];
      }

      return items
        .filter((item) => item.nextRetryAtMs <= nowMs)
        .slice(0, Math.floor(limit));
    },
    getSnapshot(): TelemetryQueueSnapshot<TPayload> {
      return {
        droppedCount,
        items: [...items],
      };
    },
    markFailed(id, error, nowMs, retryPolicy) {
      const itemIndex = items.findIndex((item) => item.id === id);
      if (itemIndex === -1) {
        return;
      }

      const item = items[itemIndex];
      const nextAttempts = item.attempts + 1;
      if (!isRetryableTelemetryError(error) || nextAttempts >= retryPolicy.maxAttempts) {
        items = items.filter((currentItem) => currentItem.id !== id);
        return;
      }

      items = items.map((currentItem) =>
        currentItem.id === id
          ? {
              ...currentItem,
              attempts: nextAttempts,
              nextRetryAtMs: calculateNextRetryAtMs({
                attempts: nextAttempts,
                nowMs,
                retryPolicy,
              }),
            }
          : currentItem
      );
    },
    markSucceeded(ids) {
      const idSet = new Set(ids);
      items = items.filter((item) => !idSet.has(item.id));
    },
    upsert(item, mergePayload: TelemetryPayloadMerge<TPayload>) {
      const normalizedItem = normalizeItem(item);
      if (!normalizedItem.dedupeKey) {
        return enqueueItem(normalizedItem);
      }

      const itemIndex = items.findIndex(
        (currentItem) => currentItem.dedupeKey === normalizedItem.dedupeKey
      );
      if (itemIndex === -1) {
        items = [...items, normalizedItem];
        enforceMaxSize();
        return normalizedItem;
      }

      const currentItem = items[itemIndex];
      const mergedItem: TelemetryQueueItem<TPayload> = {
        ...currentItem,
        kind: normalizedItem.kind,
        payload: mergePayload(currentItem, normalizedItem),
        updatedAt: normalizedItem.updatedAt,
      };
      items = items.map((current, index) => (index === itemIndex ? mergedItem : current));
      return mergedItem;
    },
  };
}
