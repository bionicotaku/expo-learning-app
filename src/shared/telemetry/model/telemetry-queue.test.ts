import { ApiError } from '@/shared/api';
import { describe, expect, it } from 'vitest';

import { createInMemoryTelemetryQueue } from './telemetry-queue';
import type { TelemetryQueueItemInput } from './types';

type DefaultTestPayload = { value: string };

function createItem<TPayload = DefaultTestPayload>(
  id: string,
  overrides: Partial<TelemetryQueueItemInput<TPayload>> = {}
): TelemetryQueueItemInput<TPayload> {
  return {
    createdAt: `2026-05-08T00:00:0${id}.000Z`,
    dedupeKey: null,
    id,
    kind: 'test.event',
    payload: { value: id } as TPayload,
    updatedAt: `2026-05-08T00:00:0${id}.000Z`,
    ...overrides,
  };
}

describe('createInMemoryTelemetryQueue', () => {
  it('enqueues items in insertion order', () => {
    const queue = createInMemoryTelemetryQueue();

    queue.enqueue(createItem('1'));
    queue.enqueue(createItem('2'));

    expect(queue.getSnapshot().items.map((item) => item.id)).toEqual(['1', '2']);
  });

  it('upserts items with the same dedupeKey by merging payloads', () => {
    const queue = createInMemoryTelemetryQueue<{ count: number; label: string }>();

    queue.upsert(
      createItem<{ count: number; label: string }>('1', {
        dedupeKey: 'same',
        payload: { count: 1, label: 'first' },
      }),
      (current, incoming) => ({
        count: current.payload.count + incoming.payload.count,
        label: incoming.payload.label,
      })
    );
    queue.upsert(
      createItem<{ count: number; label: string }>('2', {
        dedupeKey: 'same',
        payload: { count: 2, label: 'second' },
        updatedAt: '2026-05-08T00:00:09.000Z',
      }),
      (current, incoming) => ({
        count: current.payload.count + incoming.payload.count,
        label: incoming.payload.label,
      })
    );

    expect(queue.getSnapshot().items).toMatchObject([
      {
        id: '1',
        dedupeKey: 'same',
        payload: { count: 3, label: 'second' },
        updatedAt: '2026-05-08T00:00:09.000Z',
      },
    ]);
  });

  it('treats upsert without dedupeKey as a normal enqueue', () => {
    const queue = createInMemoryTelemetryQueue();

    queue.upsert(createItem('1'), () => ({ value: 'merged' }));
    queue.upsert(createItem('2'), () => ({ value: 'merged' }));

    expect(queue.getSnapshot().items.map((item) => item.id)).toEqual(['1', '2']);
  });

  it('drops the oldest item when maxSize is exceeded', () => {
    const queue = createInMemoryTelemetryQueue({ maxSize: 2 });

    queue.enqueue(createItem('1'));
    queue.enqueue(createItem('2'));
    queue.enqueue(createItem('3'));

    expect(queue.getSnapshot()).toMatchObject({
      droppedCount: 1,
      items: [{ id: '2' }, { id: '3' }],
    });
  });

  it('returns only flushable items whose retry delay has elapsed', () => {
    const queue = createInMemoryTelemetryQueue();

    queue.enqueue(createItem('1', { nextRetryAtMs: 50 }));
    queue.enqueue(createItem('2', { nextRetryAtMs: 150 }));

    expect(queue.getFlushableItems(100, 20).map((item) => item.id)).toEqual(['1']);
  });

  it('removes succeeded items by id', () => {
    const queue = createInMemoryTelemetryQueue();

    queue.enqueue(createItem('1'));
    queue.enqueue(createItem('2'));
    queue.markSucceeded(['1']);

    expect(queue.getSnapshot().items.map((item) => item.id)).toEqual(['2']);
  });

  it('keeps retryable failures with incremented attempts and backoff', () => {
    const queue = createInMemoryTelemetryQueue();

    queue.enqueue(createItem('1'));
    queue.markFailed(
      '1',
      new ApiError('retry later', { retryable: true }),
      1_000,
      {
        baseRetryDelayMs: 5_000,
        maxAttempts: 5,
        maxRetryDelayMs: 60_000,
      }
    );

    expect(queue.getSnapshot().items[0]).toMatchObject({
      attempts: 1,
      id: '1',
      nextRetryAtMs: 6_000,
    });
  });

  it('drops non-retryable failures', () => {
    const queue = createInMemoryTelemetryQueue();

    queue.enqueue(createItem('1'));
    queue.markFailed(
      '1',
      new ApiError('bad request', { retryable: false }),
      1_000,
      {
        baseRetryDelayMs: 5_000,
        maxAttempts: 5,
        maxRetryDelayMs: 60_000,
      }
    );

    expect(queue.getSnapshot().items).toEqual([]);
  });

  it('drops retryable failures after maxAttempts is reached', () => {
    const queue = createInMemoryTelemetryQueue();

    queue.enqueue(createItem('1', { attempts: 4 }));
    queue.markFailed(
      '1',
      new ApiError('retry later', { retryable: true }),
      1_000,
      {
        baseRetryDelayMs: 5_000,
        maxAttempts: 5,
        maxRetryDelayMs: 60_000,
      }
    );

    expect(queue.getSnapshot().items).toEqual([]);
  });
});
