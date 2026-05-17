import { describe, expect, it, vi } from 'vitest';

import type { TelemetryQueueItem } from '@/shared/telemetry';

import {
  createWatchProgressTelemetryItem,
  mergeWatchProgressTelemetryPayload,
  sendWatchProgressTelemetryItem,
  watchProgressTelemetryKind,
  type WatchProgressTelemetryPayload,
} from './watch-progress-telemetry';

const { reportVideoWatchProgressMock } = vi.hoisted(() => ({
  reportVideoWatchProgressMock: vi.fn(),
}));

vi.mock('../api/watch-progress-repository', () => ({
  reportVideoWatchProgress: reportVideoWatchProgressMock,
}));

describe('watch progress telemetry helpers', () => {
  it('creates a telemetry item with a stable dedupe key for the video session', () => {
    const item = createWatchProgressTelemetryItem({
      body: {
        active_watch_ms: 5_000,
        client_context: {
          app_version: '1.2.3',
          device_model: 'iPhone16,2',
          os_version: '18.5',
          platform: 'ios',
        },
        occurred_at: '2026-05-08T12:00:00.000Z',
        position_ms: 10_000,
        source_surface: 'fullscreen',
        video_id: 'video-a',
        watch_session_id: 'session-1',
      },
      createdAt: '2026-05-08T12:00:00.000Z',
      id: 'item-1',
    });

    expect(item).toMatchObject({
      dedupeKey: 'video.watch_progress:video-a:session-1',
      id: 'item-1',
      kind: watchProgressTelemetryKind,
      payload: {
        body: {
          position_ms: 10_000,
          video_id: 'video-a',
          watch_session_id: 'session-1',
        },
      },
    });
  });

  it('merges latest progress without preserving client-side completion state', () => {
    const current = {
      payload: {
        body: {
          active_watch_ms: 20_000,
          client_context: {
            app_version: '1.2.3',
            device_model: 'iPhone16,2',
            os_version: '18.5',
            platform: 'ios',
          },
          occurred_at: '2026-05-08T12:00:00.000Z',
          position_ms: 91_000,
          source_surface: 'fullscreen',
          video_id: 'video-a',
          watch_session_id: 'session-1',
        },
      },
    } as TelemetryQueueItem<WatchProgressTelemetryPayload>;
    const incoming = {
      payload: {
        body: {
          active_watch_ms: 21_000,
          client_context: {
            app_version: '1.2.4',
            device_model: 'iPhone16,2',
            os_version: '18.5',
            platform: 'ios',
          },
          occurred_at: '2026-05-08T12:00:01.000Z',
          position_ms: 60_000,
          source_surface: 'fullscreen',
          video_id: 'video-a',
          watch_session_id: 'session-1',
        },
      },
    } as TelemetryQueueItem<WatchProgressTelemetryPayload>;

    expect(mergeWatchProgressTelemetryPayload(current, incoming)).toEqual({
      body: {
        active_watch_ms: 21_000,
        client_context: {
          app_version: '1.2.4',
          device_model: 'iPhone16,2',
          os_version: '18.5',
          platform: 'ios',
        },
        occurred_at: '2026-05-08T12:00:01.000Z',
        position_ms: 60_000,
        source_surface: 'fullscreen',
        video_id: 'video-a',
        watch_session_id: 'session-1',
      },
    });
  });

  it('sends telemetry items through the watch-progress API facade', async () => {
    reportVideoWatchProgressMock.mockResolvedValueOnce(undefined);
    const item = createWatchProgressTelemetryItem({
      body: {
        active_watch_ms: 5_000,
        client_context: {
          app_version: '1.2.3',
          device_model: 'iPhone16,2',
          os_version: '18.5',
          platform: 'ios',
        },
        occurred_at: '2026-05-08T12:00:00.000Z',
        position_ms: 10_000,
        source_surface: 'fullscreen',
        video_id: 'video-a',
        watch_session_id: 'session-1',
      },
      createdAt: '2026-05-08T12:00:00.000Z',
      id: 'item-1',
    });

    await sendWatchProgressTelemetryItem(item);

    expect(reportVideoWatchProgressMock).toHaveBeenCalledWith(item.payload.body);
  });
});
