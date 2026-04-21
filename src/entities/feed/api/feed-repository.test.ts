import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchFeed } from '@/entities/feed';
import { resetMockFeedSequence } from './mock-feed-repository';

describe('feed repository facade', () => {
  beforeEach(() => {
    resetMockFeedSequence();
  });

  it('keeps the public feed snapshot contract stable', async () => {
    const response = await fetchFeed();

    expect(response).toMatchObject({
      items: expect.arrayContaining([
        expect.objectContaining({
          videoId: 'the-office-health-care-video-1',
          title: expect.any(String),
          description: expect.any(String),
          videoUrl: expect.stringContaining('playlist.m3u8'),
          durationSeconds: expect.any(Number),
          viewCount: expect.any(Number),
          tags: expect.any(Array),
          isLiked: expect.any(Boolean),
          isFavorited: expect.any(Boolean),
        }),
      ]),
    });
  });

  it('keeps the mock feed facade on a 2 second delay by default', async () => {
    vi.useFakeTimers();

    let resolved = false;
    const request = fetchFeed().then(() => {
      resolved = true;
    });

    await vi.advanceTimersByTimeAsync(1999);
    expect(resolved).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await expect(request).resolves.toBeUndefined();

    vi.useRealTimers();
  });
});
