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
          client_context: {
            app_version: '1.2.3',
            device_model: 'iPhone16,2',
            os_version: '18.5',
            platform: 'ios',
          },
          duration_ms: 100_000,
          is_completed: false,
          occurred_at: '2026-05-08T12:00:00.000Z',
          position_ms: 10_000,
          source_surface: 'fullscreen',
          watch_session_id: 'session-1',
        },
      createdAt: '2026-05-08T12:00:00.000Z',
      id: 'item-1',
      videoId: 'video-a',
    });

    expect(item).toMatchObject({
      dedupeKey: 'video.watch_progress:video-a:session-1',
      id: 'item-1',
      kind: watchProgressTelemetryKind,
      payload: {
        videoId: 'video-a',
        body: {
          position_ms: 10_000,
          watch_session_id: 'session-1',
        },
      },
    });
  });

  it('merges latest progress while preserving completed=true', () => {
    const current = {
      payload: {
        videoId: 'video-a',
        body: {
          duration_ms: 100_000,
          is_completed: true,
          client_context: {
            app_version: '1.2.3',
            device_model: 'iPhone16,2',
            os_version: '18.5',
            platform: 'ios',
          },
          occurred_at: '2026-05-08T12:00:00.000Z',
          position_ms: 91_000,
          source_surface: 'fullscreen',
          watch_session_id: 'session-1',
        },
      },
    } as TelemetryQueueItem<WatchProgressTelemetryPayload>;
    const incoming = {
      payload: {
        videoId: 'video-a',
        body: {
          duration_ms: 100_000,
          is_completed: false,
          client_context: {
            app_version: '1.2.4',
            device_model: 'iPhone16,2',
            os_version: '18.5',
            platform: 'ios',
          },
          occurred_at: '2026-05-08T12:00:01.000Z',
          position_ms: 60_000,
          source_surface: 'fullscreen',
          watch_session_id: 'session-1',
        },
      },
    } as TelemetryQueueItem<WatchProgressTelemetryPayload>;

    expect(mergeWatchProgressTelemetryPayload(current, incoming)).toEqual({
      videoId: 'video-a',
      body: {
        duration_ms: 100_000,
        is_completed: true,
        client_context: {
          app_version: '1.2.4',
          device_model: 'iPhone16,2',
          os_version: '18.5',
          platform: 'ios',
        },
        occurred_at: '2026-05-08T12:00:01.000Z',
        position_ms: 60_000,
        source_surface: 'fullscreen',
        watch_session_id: 'session-1',
      },
    });
  });

  it('sends telemetry items through the watch-progress API facade', async () => {
    reportVideoWatchProgressMock.mockResolvedValueOnce(undefined);
    const item = createWatchProgressTelemetryItem({
        body: {
          client_context: {
            app_version: '1.2.3',
            device_model: 'iPhone16,2',
            os_version: '18.5',
            platform: 'ios',
          },
          duration_ms: 100_000,
          is_completed: false,
          occurred_at: '2026-05-08T12:00:00.000Z',
          position_ms: 10_000,
          source_surface: 'fullscreen',
          watch_session_id: 'session-1',
        },
      createdAt: '2026-05-08T12:00:00.000Z',
      id: 'item-1',
      videoId: 'video-a',
    });

    await sendWatchProgressTelemetryItem(item);

    expect(reportVideoWatchProgressMock).toHaveBeenCalledWith(
      'video-a',
      item.payload.body
    );
  });
});
