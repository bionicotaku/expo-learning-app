import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createMockFeedResponse,
  fetchMockFeed,
  resetMockFeedSequence,
} from './mock-feed-repository';

describe('mock feed repository', () => {
  const expectedClipDurationsSeconds = [76, 180, 174, 163, 163, 159, 160, 163];

  beforeEach(() => {
    resetMockFeedSequence();
  });

  it('creates a stable eight-item feed snapshot backed by the real clip cover and HLS urls', () => {
    const response = createMockFeedResponse();

    expect(response.items).toHaveLength(8);
    expect(response.recommendation_run_id).toBe(
      '00000000-0000-4000-8000-000000000000'
    );
    expect(new Set(response.items.map((item) => item.video_id)).size).toBe(8);
    expect(response.items[0]).toMatchObject({
      video_id: '00000000-0000-4000-8000-000000000001',
      duration_seconds: 76,
      cover_image_url:
        'https://storage.googleapis.com/videos2077/test-video/cover/The%20Office%20(US)%20(2005)%20-%20S01E03%20-%20Health%20Care%20(1080p%20BluRay%20x265%20Silence)-clip1.webp',
      video_url:
        'https://storage.googleapis.com/videos2077/test-video/hls/The Office (US) (2005) - S01E03 - Health Care (1080p BluRay x265 Silence)-clip1_hls/playlist.m3u8',
      learning_units: expect.arrayContaining([
        expect.objectContaining({
          coarse_unit_id: 89008,
          text: 'give',
          role: 'near_future',
          is_primary: true,
          evidence_sentence_index: 15,
          evidence_span_index: 1,
          evidence_start_ms: 31493,
          evidence_end_ms: 31670,
        }),
      ]),
    });
    expect(response.items[0]).not.toHaveProperty('tags');
    expect(response.items[7]).toMatchObject({
      video_id: '00000000-0000-4000-8000-000000000008',
      duration_seconds: 163,
      cover_image_url:
        'https://storage.googleapis.com/videos2077/test-video/cover/The%20Office%20(US)%20(2005)%20-%20S01E03%20-%20Health%20Care%20(1080p%20BluRay%20x265%20Silence)-clip8.webp',
      video_url:
        'https://storage.googleapis.com/videos2077/test-video/hls/The Office (US) (2005) - S01E03 - Health Care (1080p BluRay x265 Silence)-clip8_hls/playlist.m3u8',
    });
  });

  it('uses buffered clip durations and keeps learning unit evidence inside each video', () => {
    const response = createMockFeedResponse();

    expect(response.items.map((item) => item.duration_seconds)).toEqual(
      expectedClipDurationsSeconds
    );

    for (const item of response.items) {
      const durationMs = item.duration_seconds * 1000;

      for (const learningUnit of item.learning_units) {
        expect(learningUnit.evidence_end_ms).toBeLessThanOrEqual(durationMs);
      }
    }
  });

  it('returns the same derived fields for the same clip on every read', () => {
    const first = createMockFeedResponse();
    const second = createMockFeedResponse();

    expect(second).toEqual(first);
  });

  it('returns a new batch of unique video ids on each stateless read while reusing the eight clip assets', async () => {
    const first = await fetchMockFeed();
    const second = await fetchMockFeed();

    expect(first.items).toHaveLength(8);
    expect(second.items).toHaveLength(8);
    expect(first.recommendation_run_id).toBe(
      '00000000-0000-4000-8000-000000000000'
    );
    expect(second.recommendation_run_id).toBe(
      '00000000-0000-4000-8000-000000000008'
    );
    expect(first.items[0]?.video_id).toBe('00000000-0000-4000-8000-000000000001');
    expect(second.items[0]?.video_id).toBe('00000000-0000-4000-8000-000000000009');
    expect(
      first.items.every((item, index) => item.video_id !== second.items[index]?.video_id)
    ).toBe(true);
    expect(second.items[0]).toMatchObject({
      cover_image_url:
        'https://storage.googleapis.com/videos2077/test-video/cover/The%20Office%20(US)%20(2005)%20-%20S01E03%20-%20Health%20Care%20(1080p%20BluRay%20x265%20Silence)-clip1.webp',
      video_url:
        'https://storage.googleapis.com/videos2077/test-video/hls/The Office (US) (2005) - S01E03 - Health Care (1080p BluRay x265 Silence)-clip1_hls/playlist.m3u8',
      learning_units: first.items[0]?.learning_units,
    });
  });

  it('resolves after the configured mock network delay', async () => {
    vi.useFakeTimers();

    let resolved = false;
    const request = fetchMockFeed({ delayMs: 3000 }).then((response) => {
      resolved = true;
      return response;
    });

    await vi.advanceTimersByTimeAsync(2999);
    expect(resolved).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await expect(request).resolves.toMatchObject({
      items: expect.arrayContaining([
        expect.objectContaining({
          video_id: '00000000-0000-4000-8000-000000000001',
        }),
      ]),
    });

    vi.useRealTimers();
  });
});
