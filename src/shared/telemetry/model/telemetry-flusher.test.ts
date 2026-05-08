import { ApiError } from '@/shared/api';
import { describe, expect, it, vi } from 'vitest';

import { flushTelemetryQueue } from './telemetry-flusher';
import { createInMemoryTelemetryQueue } from './telemetry-queue';
import type { TelemetryQueueItem } from './types';

function createItem(id: string): TelemetryQueueItem<{ value: string }> {
  return {
    attempts: 0,
    createdAt: `2026-05-08T00:00:0${id}.000Z`,
    dedupeKey: null,
    id,
    kind: 'test.event',
    nextRetryAtMs: 0,
    payload: { value: id },
    updatedAt: `2026-05-08T00:00:0${id}.000Z`,
  };
}

describe('flushTelemetryQueue', () => {
  it('removes items after successful sends', async () => {
    const queue = createInMemoryTelemetryQueue<{ value: string }>();
    queue.enqueue(createItem('1'));
    queue.enqueue(createItem('2'));

    const result = await flushTelemetryQueue(queue, {
      nowMs: 1_000,
      sender: vi.fn().mockResolvedValue(undefined),
    });

    expect(result).toMatchObject({
      failedCount: 0,
      sentCount: 2,
      skipped: false,
    });
    expect(queue.getSnapshot().items).toEqual([]);
  });

  it('keeps retryable failures and schedules retry', async () => {
    const queue = createInMemoryTelemetryQueue<{ value: string }>();
    queue.enqueue(createItem('1'));

    const result = await flushTelemetryQueue(queue, {
      nowMs: 1_000,
      sender: vi.fn().mockRejectedValue(new ApiError('timeout', { retryable: true })),
    });

    expect(result).toMatchObject({
      failedCount: 1,
      sentCount: 0,
      skipped: false,
    });
    expect(queue.getSnapshot().items[0]).toMatchObject({
      attempts: 1,
      id: '1',
      nextRetryAtMs: 6_000,
    });
  });

  it('drops non-retryable failures', async () => {
    const queue = createInMemoryTelemetryQueue<{ value: string }>();
    queue.enqueue(createItem('1'));

    await flushTelemetryQueue(queue, {
      nowMs: 1_000,
      sender: vi.fn().mockRejectedValue(new ApiError('bad request', { retryable: false })),
    });

    expect(queue.getSnapshot().items).toEqual([]);
  });

  it('limits concurrent sends to the default concurrency of 3', async () => {
    const queue = createInMemoryTelemetryQueue<{ value: string }>();
    for (const id of ['1', '2', '3', '4', '5']) {
      queue.enqueue(createItem(id));
    }

    let activeCount = 0;
    let maxActiveCount = 0;
    const sender = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          activeCount += 1;
          maxActiveCount = Math.max(maxActiveCount, activeCount);
          setTimeout(() => {
            activeCount -= 1;
            resolve();
          }, 5);
        })
    );

    await flushTelemetryQueue(queue, {
      nowMs: 1_000,
      sender,
    });

    expect(sender).toHaveBeenCalledTimes(5);
    expect(maxActiveCount).toBe(3);
  });

  it('skips a second flush while the same queue is already flushing', async () => {
    const queue = createInMemoryTelemetryQueue<{ value: string }>();
    queue.enqueue(createItem('1'));

    let resolveSend: () => void = () => undefined;
    const sender = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSend = resolve;
        })
    );

    const firstFlush = flushTelemetryQueue(queue, {
      nowMs: 1_000,
      sender,
    });
    const secondFlush = await flushTelemetryQueue(queue, {
      nowMs: 1_000,
      sender,
    });

    expect(secondFlush).toMatchObject({
      skipped: true,
      sentCount: 0,
    });
    expect(sender).toHaveBeenCalledTimes(1);

    resolveSend?.();
    await firstFlush;
  });
});
