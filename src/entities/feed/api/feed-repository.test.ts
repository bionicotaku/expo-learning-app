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
      recommendation_run_id: expect.stringMatching(
        /^00000000-0000-4000-8000-[0-9a-f]{12}$/
      ),
      items: expect.arrayContaining([
        expect.objectContaining({
          video_id: '00000000-0000-4000-8000-000000000001',
          title: expect.any(String),
          description: expect.any(String),
          video_url: expect.stringContaining('playlist.m3u8'),
          duration_seconds: expect.any(Number),
          view_count: expect.any(Number),
          like_count: expect.any(Number),
          favorite_count: expect.any(Number),
          learning_units: expect.arrayContaining([
            expect.objectContaining({
              coarse_unit_id: expect.any(Number),
              text: expect.any(String),
              role: expect.stringMatching(
                /^(hard_review|new_now|soft_review|near_future)$/
              ),
              is_primary: expect.any(Boolean),
              evidence_sentence_index: expect.any(Number),
              evidence_span_index: expect.any(Number),
              evidence_start_ms: expect.any(Number),
              evidence_end_ms: expect.any(Number),
            }),
          ]),
        }),
      ]),
    });
    expect(response.items[0]).not.toHaveProperty('tags');
    expect(response.items[0]).not.toHaveProperty('isLiked');
    expect(response.items[0]).not.toHaveProperty('isFavorited');
  });

  it('generates mock like and favorite counts in the 8000 to 12000 range', async () => {
    const response = await fetchFeed();

    for (const item of response.items) {
      expect(item.like_count).toBeGreaterThanOrEqual(8000);
      expect(item.like_count).toBeLessThanOrEqual(12000);
      expect(item.favorite_count).toBeGreaterThanOrEqual(8000);
      expect(item.favorite_count).toBeLessThanOrEqual(12000);
    }
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
