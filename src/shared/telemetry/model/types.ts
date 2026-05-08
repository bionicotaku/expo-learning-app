export type TelemetryQueueItem<TPayload = unknown> = {
  attempts: number;
  createdAt: string;
  dedupeKey: string | null;
  id: string;
  kind: string;
  nextRetryAtMs: number;
  payload: TPayload;
  updatedAt: string;
};

export type TelemetryQueueItemInput<TPayload = unknown> = Omit<
  TelemetryQueueItem<TPayload>,
  'attempts' | 'nextRetryAtMs'
> &
  Partial<Pick<TelemetryQueueItem<TPayload>, 'attempts' | 'nextRetryAtMs'>>;

export type TelemetryQueueSnapshot<TPayload = unknown> = {
  droppedCount: number;
  items: TelemetryQueueItem<TPayload>[];
};

export type TelemetryPayloadMerge<TPayload = unknown> = (
  current: TelemetryQueueItem<TPayload>,
  incoming: TelemetryQueueItem<TPayload>
) => TPayload;

export type TelemetryRetryPolicy = {
  baseRetryDelayMs: number;
  maxAttempts: number;
  maxRetryDelayMs: number;
};

export type TelemetryQueue<TPayload = unknown> = {
  clear(): void;
  enqueue(item: TelemetryQueueItemInput<TPayload>): TelemetryQueueItem<TPayload>;
  getFlushableItems(nowMs: number, limit: number): TelemetryQueueItem<TPayload>[];
  getSnapshot(): TelemetryQueueSnapshot<TPayload>;
  markFailed(
    id: string,
    error: unknown,
    nowMs: number,
    retryPolicy: TelemetryRetryPolicy
  ): void;
  markSucceeded(ids: readonly string[]): void;
  upsert(
    item: TelemetryQueueItemInput<TPayload>,
    mergePayload: TelemetryPayloadMerge<TPayload>
  ): TelemetryQueueItem<TPayload>;
};

export type TelemetrySender<TPayload = unknown> = (
  item: TelemetryQueueItem<TPayload>
) => Promise<void>;

export type TelemetryFlushResult = {
  droppedCount: number;
  failedCount: number;
  skipped: boolean;
  sentCount: number;
};
