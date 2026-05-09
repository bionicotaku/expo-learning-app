import { useCallback, useMemo, useRef } from 'react';

import {
  createInMemoryTelemetryQueue,
  flushTelemetryQueue as flushSharedTelemetryQueue,
  type TelemetryQueue,
  type TelemetryFlushResult,
} from '@/shared/telemetry';

import type { WatchProgressRequestBody, WatchProgressSource } from './types';
import {
  createWatchProgressTelemetryItem,
  mergeWatchProgressTelemetryPayload,
  sendWatchProgressTelemetryItem,
  type WatchProgressTelemetryPayload,
} from './watch-progress-telemetry';

const defaultThrottleMs = 1_000;
const defaultCompletedRatio = 0.9;
const defaultWatchProgressSource: WatchProgressSource = 'web';
const defaultWatchProgressTelemetryQueue =
  createInMemoryTelemetryQueue<WatchProgressTelemetryPayload>();

type ProgressSample = {
  activeVisitToken: number | null;
  currentTimeSeconds: number;
  durationSeconds: number;
  videoId: string;
};

export type UseVideoWatchProgressReporterOptions = {
  createSessionId?: () => string;
  flushTelemetryQueue?: () => Promise<unknown>;
  nowIso?: () => string;
  nowMs?: () => number;
  queue?: TelemetryQueue<WatchProgressTelemetryPayload>;
  source?: WatchProgressSource;
  throttleMs?: number;
};

export type UseVideoWatchProgressReporterResult = {
  flush: () => Promise<unknown>;
  reportSample: (sample: ProgressSample) => void;
};

function createDefaultWatchSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `watch-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getDefaultNowMs(): number {
  return Date.now();
}

function getDefaultNowIso(): string {
  return new Date().toISOString();
}

function createDefaultTelemetryItemId(): string {
  return `watch-progress-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isValidProgressSample(sample: ProgressSample) {
  return (
    sample.videoId.length > 0 &&
    sample.activeVisitToken !== null &&
    Number.isFinite(sample.currentTimeSeconds) &&
    Number.isFinite(sample.durationSeconds) &&
    sample.currentTimeSeconds >= 0 &&
    sample.durationSeconds > 0
  );
}

function createSessionKey({
  activeVisitToken,
  videoId,
}: {
  activeVisitToken: number;
  videoId: string;
}) {
  return `${videoId}:${activeVisitToken}`;
}

export function useVideoWatchProgressReporter(
  options: UseVideoWatchProgressReporterOptions = {}
): UseVideoWatchProgressReporterResult {
  const {
    createSessionId = createDefaultWatchSessionId,
    flushTelemetryQueue,
    nowIso = getDefaultNowIso,
    nowMs = getDefaultNowMs,
    queue = defaultWatchProgressTelemetryQueue,
    source = defaultWatchProgressSource,
    throttleMs = defaultThrottleMs,
  } = options;
  const sessionIdsByKeyRef = useRef(new Map<string, string>());
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

      const activeVisitToken = sample.activeVisitToken;
      if (activeVisitToken === null) {
        return;
      }

      const currentNowMs = nowMs();
      const sessionKey = createSessionKey({
        activeVisitToken,
        videoId: sample.videoId,
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

      let watchSessionId = sessionIdsByKeyRef.current.get(sessionKey);
      if (!watchSessionId) {
        watchSessionId = createSessionId();
        sessionIdsByKeyRef.current.set(sessionKey, watchSessionId);
      }

      const occurredAt = nowIso();
      const body: WatchProgressRequestBody = {
        duration_ms: durationMs,
        is_completed: isCompleted,
        metadata: {
          surface: 'fullscreen',
        },
        occurred_at: occurredAt,
        position_ms: positionMs,
        source,
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
    [createSessionId, flush, nowIso, nowMs, queue, source, throttleMs]
  );

  return useMemo(
    () => ({
      flush,
      reportSample,
    }),
    [flush, reportSample]
  );
}
