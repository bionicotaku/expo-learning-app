import { describe, expect, it } from 'vitest';

import {
  createWatchProgressRequest,
  reportVideoWatchProgress,
} from './watch-progress-repository';
import type { WatchProgressRequestBody } from '../model/types';

function createBody(): WatchProgressRequestBody {
  return {
    active_watch_ms: 12_000,
    client_context: {
      app_version: '1.2.3',
      device_model: 'iPhone16,2',
      os_version: '18.5',
      platform: 'ios',
    },
    occurred_at: '2026-05-08T12:00:00.000Z',
    position_ms: 42_000,
    source_surface: 'fullscreen',
    video_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    watch_session_id: 'session-1',
  };
}

describe('watch progress repository', () => {
  it('creates a POST request descriptor for the watch-progress endpoint', () => {
    const body = createBody();

    expect(createWatchProgressRequest(body)).toEqual({
      body,
      method: 'POST',
      path: '/video-watch-progress',
    });
  });

  it('keeps the snake_case request body unchanged', () => {
    const body = createBody();

    expect(createWatchProgressRequest(body).body).toEqual({
      active_watch_ms: 12_000,
      client_context: {
        app_version: '1.2.3',
        device_model: 'iPhone16,2',
        os_version: '18.5',
        platform: 'ios',
      },
      occurred_at: '2026-05-08T12:00:00.000Z',
      position_ms: 42_000,
      source_surface: 'fullscreen',
      video_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      watch_session_id: 'session-1',
    });
    expect(createWatchProgressRequest(body).body).not.toHaveProperty('is_completed');
  });

  it('resolves through the mock watch-progress sender', async () => {
    await expect(reportVideoWatchProgress(createBody())).resolves.toEqual({
      accepted: true,
    });
  });
});
