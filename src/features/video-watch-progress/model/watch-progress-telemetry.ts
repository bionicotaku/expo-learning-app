import type { TelemetryQueueItem } from '@/shared/telemetry';

import { reportVideoWatchProgress } from '../api/watch-progress-repository';
import type { WatchProgressRequestBody } from './types';

export const watchProgressTelemetryKind = 'video.watch_progress';

export type WatchProgressTelemetryPayload = {
  body: WatchProgressRequestBody;
  videoId: string;
};

export function createWatchProgressTelemetryDedupeKey({
  videoId,
  watchSessionId,
}: {
  videoId: string;
  watchSessionId: string;
}) {
  return `${watchProgressTelemetryKind}:${videoId}:${watchSessionId}`;
}

export function createWatchProgressTelemetryItem({
  body,
  createdAt,
  id,
  videoId,
}: {
  body: WatchProgressRequestBody;
  createdAt: string;
  id: string;
  videoId: string;
}): TelemetryQueueItem<WatchProgressTelemetryPayload> {
  return {
    attempts: 0,
    createdAt,
    dedupeKey: createWatchProgressTelemetryDedupeKey({
      videoId,
      watchSessionId: body.watch_session_id,
    }),
    id,
    kind: watchProgressTelemetryKind,
    payload: {
      body,
      videoId,
    },
    nextRetryAtMs: 0,
    updatedAt: createdAt,
  };
}

export function mergeWatchProgressTelemetryPayload(
  current: TelemetryQueueItem<WatchProgressTelemetryPayload>,
  incoming: TelemetryQueueItem<WatchProgressTelemetryPayload>
): WatchProgressTelemetryPayload {
  return {
    body: {
      ...incoming.payload.body,
      is_completed:
        current.payload.body.is_completed || incoming.payload.body.is_completed,
    },
    videoId: incoming.payload.videoId,
  };
}

export async function sendWatchProgressTelemetryItem(
  item: TelemetryQueueItem<WatchProgressTelemetryPayload>
): Promise<void> {
  await reportVideoWatchProgress(item.payload.videoId, item.payload.body);
}
