export type {
  TelemetryFlushResult,
  TelemetryPayloadMerge,
  TelemetryQueue,
  TelemetryQueueItem,
  TelemetryQueueItemInput,
  TelemetryQueueSnapshot,
  TelemetryRetryPolicy,
  TelemetrySender,
} from './model/types';
export {
  DEFAULT_TELEMETRY_BASE_RETRY_DELAY_MS,
  DEFAULT_TELEMETRY_FLUSH_CONCURRENCY,
  DEFAULT_TELEMETRY_FLUSH_MAX_ITEMS,
  DEFAULT_TELEMETRY_MAX_ATTEMPTS,
  DEFAULT_TELEMETRY_MAX_RETRY_DELAY_MS,
  flushTelemetryQueue,
} from './model/telemetry-flusher';
export { createInMemoryTelemetryQueue } from './model/telemetry-queue';
