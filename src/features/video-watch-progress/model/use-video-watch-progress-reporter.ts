import { useCallback, useMemo, useRef } from 'react';

import {
  getClientEnvironment,
  toAnalyticsClientContext,
  type AnalyticsClientContext,
} from '@/shared/lib/client-environment';
import {
  createInMemoryTelemetryQueue,
  flushTelemetryQueue as flushSharedTelemetryQueue,
  type TelemetryQueue,
  type TelemetryFlushResult,
} from '@/shared/telemetry';

import type { WatchProgressRequestBody, WatchProgressSurface } from './types';
import {
  createWatchProgressTelemetryItem,
  mergeWatchProgressTelemetryPayload,
  sendWatchProgressTelemetryItem,
  type WatchProgressTelemetryPayload,
} from './watch-progress-telemetry';

const defaultThrottleMs = 1_000;
const defaultCompletedRatio = 0.9;
const defaultWatchProgressSourceSurface: WatchProgressSurface = 'fullscreen';
const defaultWatchProgressTelemetryQueue =
  createInMemoryTelemetryQueue<WatchProgressTelemetryPayload>();

type ProgressSample = {
  currentTimeSeconds: number;
  durationSeconds: number;
  videoId: string;
  watchSessionId: string | null;
};

export type UseVideoWatchProgressReporterOptions = {
  flushTelemetryQueue?: () => Promise<unknown>;
  getClientContext?: () => AnalyticsClientContext;
  nowIso?: () => string;
  nowMs?: () => number;
  queue?: TelemetryQueue<WatchProgressTelemetryPayload>;
  sourceSurface?: WatchProgressSurface;
  throttleMs?: number;
};

export type UseVideoWatchProgressReporterResult = {
  flush: () => Promise<unknown>;
  reportSample: (sample: ProgressSample) => void;
};

function getDefaultNowMs(): number {
  return Date.now();
}

function getDefaultNowIso(): string {
  return new Date().toISOString();
}

function createDefaultTelemetryItemId(): string {
  return `watch-progress-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getDefaultAnalyticsClientContext(): AnalyticsClientContext {
  return toAnalyticsClientContext(getClientEnvironment());
}

function isValidProgressSample(sample: ProgressSample) {
  return (
    sample.videoId.length > 0 &&
    sample.watchSessionId !== null &&
    sample.watchSessionId.length > 0 &&
    Number.isFinite(sample.currentTimeSeconds) &&
    Number.isFinite(sample.durationSeconds) &&
    sample.currentTimeSeconds >= 0 &&
    sample.durationSeconds > 0
  );
}

function createSessionKey({
  videoId,
  watchSessionId,
}: {
  videoId: string;
  watchSessionId: string;
}) {
  return `${videoId}:${watchSessionId}`;
}

export function useVideoWatchProgressReporter(
  options: UseVideoWatchProgressReporterOptions = {}
): UseVideoWatchProgressReporterResult {
  const {
    flushTelemetryQueue,
    getClientContext = getDefaultAnalyticsClientContext,
    nowIso = getDefaultNowIso,
    nowMs = getDefaultNowMs,
    queue = defaultWatchProgressTelemetryQueue,
    sourceSurface = defaultWatchProgressSourceSurface,
    throttleMs = defaultThrottleMs,
  } = options;
  const lastAcceptedAtByKeyRef = useRef(new Map<string, number>());
  const completedKeysRef = useRef(new Set<string>());

  const flush = useCallback(async (): Promise<TelemetryFlushResult | unknown> => {
    if (flushTelemetryQueue) {
      return flushTelemetryQueue();
    }

    return flushSharedTelemetryQueue(queue, {
      sender: sendWatchProgressTelemetryItem,
    });
  }, [flushTelemetryQueue, queue]);

  const reportSample = useCallback(
    (sample: ProgressSample) => {
      if (!isValidProgressSample(sample)) {
        return;
      }

      const watchSessionId = sample.watchSessionId;
      if (watchSessionId === null) {
        return;
      }

      const currentNowMs = nowMs();
      const sessionKey = createSessionKey({
        videoId: sample.videoId,
        watchSessionId,
      });
      const positionMs = Math.round(sample.currentTimeSeconds * 1_000);
      const durationMs = Math.round(sample.durationSeconds * 1_000);
      if (!Number.isFinite(positionMs) || !Number.isFinite(durationMs) || durationMs <= 0) {
        return;
      }

      const isCompleted = positionMs / durationMs >= defaultCompletedRatio;
      const isFirstCompletedSample = isCompleted && !completedKeysRef.current.has(sessionKey);
      const lastAcceptedAtMs = lastAcceptedAtByKeyRef.current.get(sessionKey);
      if (
        !isFirstCompletedSample &&
        lastAcceptedAtMs !== undefined &&
        currentNowMs - lastAcceptedAtMs < throttleMs
      ) {
        return;
      }

      const occurredAt = nowIso();
      const body: WatchProgressRequestBody = {
        client_context: getClientContext(),
        duration_ms: durationMs,
        is_completed: isCompleted,
        occurred_at: occurredAt,
        position_ms: positionMs,
        source_surface: sourceSurface,
        watch_session_id: watchSessionId,
      };

      queue.upsert(
        createWatchProgressTelemetryItem({
          body,
          createdAt: occurredAt,
          id: createDefaultTelemetryItemId(),
          videoId: sample.videoId,
        }),
        mergeWatchProgressTelemetryPayload
      );
      lastAcceptedAtByKeyRef.current.set(sessionKey, currentNowMs);

      if (isFirstCompletedSample) {
        completedKeysRef.current.add(sessionKey);
        void flush();
      }
    },
    [flush, getClientContext, nowIso, nowMs, queue, sourceSurface, throttleMs]
  );

  return useMemo(
    () => ({
      flush,
      reportSample,
    }),
    [flush, reportSample]
  );
}
