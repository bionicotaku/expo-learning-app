import type { TelemetryQueueItem } from '@/shared/telemetry';

import { reportVideoWatchProgress } from '../api/watch-progress-repository';
import type { WatchProgressRequestBody } from './types';

export const watchProgressTelemetryKind = 'video.watch_progress';

export type WatchProgressTelemetryPayload = {
  body: WatchProgressRequestBody;
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
}: {
  body: WatchProgressRequestBody;
  createdAt: string;
  id: string;
}): TelemetryQueueItem<WatchProgressTelemetryPayload> {
  return {
    attempts: 0,
    createdAt,
    dedupeKey: createWatchProgressTelemetryDedupeKey({
      videoId: body.video_id,
      watchSessionId: body.watch_session_id,
    }),
    id,
    kind: watchProgressTelemetryKind,
    payload: {
      body,
    },
    nextRetryAtMs: 0,
    updatedAt: createdAt,
  };
}

export function mergeWatchProgressTelemetryPayload(
  _current: TelemetryQueueItem<WatchProgressTelemetryPayload>,
  incoming: TelemetryQueueItem<WatchProgressTelemetryPayload>
): WatchProgressTelemetryPayload {
  return incoming.payload;
}

export async function sendWatchProgressTelemetryItem(
  item: TelemetryQueueItem<WatchProgressTelemetryPayload>
): Promise<void> {
  await reportVideoWatchProgress(item.payload.body);
}
