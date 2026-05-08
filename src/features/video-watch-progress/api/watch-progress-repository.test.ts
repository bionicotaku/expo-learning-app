import { describe, expect, it } from 'vitest';

import {
  createWatchProgressRequest,
  reportVideoWatchProgress,
} from './watch-progress-repository';
import type { WatchProgressRequestBody } from '../model/types';

function createBody(): WatchProgressRequestBody {
  return {
    duration_ms: 120_000,
    is_completed: false,
    metadata: {
      surface: 'fullscreen',
    },
    occurred_at: '2026-05-08T12:00:00.000Z',
    position_ms: 42_000,
    source: 'ios',
    watch_session_id: 'session-1',
  };
}

describe('watch progress repository', () => {
  it('creates a POST request descriptor for the encoded watch-progress path', () => {
    const body = createBody();

    expect(createWatchProgressRequest('video id/1', body)).toEqual({
      body,
      method: 'POST',
      path: '/catalog/videos/video%20id%2F1/watch-progress',
    });
  });

  it('keeps the snake_case request body unchanged', () => {
    const body = createBody();

    expect(createWatchProgressRequest('video-1', body).body).toEqual({
      duration_ms: 120_000,
      is_completed: false,
      metadata: {
        surface: 'fullscreen',
      },
      occurred_at: '2026-05-08T12:00:00.000Z',
      position_ms: 42_000,
      source: 'ios',
      watch_session_id: 'session-1',
    });
  });

  it('resolves for any mock video id', async () => {
    await expect(
      reportVideoWatchProgress('missing-video-id', createBody())
    ).resolves.toBeUndefined();
  });
});
