import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createMockFeedResponse,
  fetchMockFeed,
  resetMockFeedSequence,
} from './mock-feed-repository';

describe('mock feed repository', () => {
  beforeEach(() => {
    resetMockFeedSequence();
  });

  it('creates a stable eight-item feed snapshot backed by the real clip cover and HLS urls', () => {
    const response = createMockFeedResponse();

    expect(response.items).toHaveLength(8);
    expect(new Set(response.items.map((item) => item.videoId)).size).toBe(8);
    expect(response.items[0]).toMatchObject({
      videoId: 'the-office-health-care-video-1',
      coverImageUrl:
        'https://storage.googleapis.com/videos2077/test-video/cover/The%20Office%20(US)%20(2005)%20-%20S01E03%20-%20Health%20Care%20(1080p%20BluRay%20x265%20Silence)-clip1.webp',
      videoUrl:
        'https://storage.googleapis.com/videos2077/test-video/hls/The Office (US) (2005) - S01E03 - Health Care (1080p BluRay x265 Silence)-clip1_hls/playlist.m3u8',
    });
    expect(response.items[7]).toMatchObject({
      videoId: 'the-office-health-care-video-8',
      coverImageUrl:
        'https://storage.googleapis.com/videos2077/test-video/cover/The%20Office%20(US)%20(2005)%20-%20S01E03%20-%20Health%20Care%20(1080p%20BluRay%20x265%20Silence)-clip8.webp',
      videoUrl:
        'https://storage.googleapis.com/videos2077/test-video/hls/The Office (US) (2005) - S01E03 - Health Care (1080p BluRay x265 Silence)-clip8_hls/playlist.m3u8',
    });
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
    expect(first.items[0]?.videoId).toBe('the-office-health-care-video-1');
    expect(second.items[0]?.videoId).toBe('the-office-health-care-video-9');
    expect(
      first.items.every((item, index) => item.videoId !== second.items[index]?.videoId)
    ).toBe(true);
    expect(second.items[0]).toMatchObject({
      coverImageUrl:
        'https://storage.googleapis.com/videos2077/test-video/cover/The%20Office%20(US)%20(2005)%20-%20S01E03%20-%20Health%20Care%20(1080p%20BluRay%20x265%20Silence)-clip1.webp',
      videoUrl:
        'https://storage.googleapis.com/videos2077/test-video/hls/The Office (US) (2005) - S01E03 - Health Care (1080p BluRay x265 Silence)-clip1_hls/playlist.m3u8',
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
          videoId: 'the-office-health-care-video-1',
        }),
      ]),
    });

    vi.useRealTimers();
  });
});
