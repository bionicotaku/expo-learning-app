import { describe, expect, it } from 'vitest';

import { fetchVideoMeta } from './video-meta-repository';

describe('video meta repository', () => {
  it('returns current user flags and transcript url for a video id', async () => {
    await expect(fetchVideoMeta('the-office-health-care-video-1')).resolves.toMatchObject({
      videoId: 'the-office-health-care-video-1',
      isLiked: expect.any(Boolean),
      isFavorited: expect.any(Boolean),
      transcriptUrl:
        'https://storage.googleapis.com/videos2077/test-video/transcript/The%20Office%20(US)%20(2005)%20-%20S01E03%20-%20Health%20Care%20(1080p%20BluRay%20x265%20Silence)-clip1.json',
    });
  });

  it('keeps transcript urls aligned with the shared mock clip catalog', async () => {
    const first = await fetchVideoMeta('the-office-health-care-video-1');
    const ninth = await fetchVideoMeta('the-office-health-care-video-9');

    expect(first.transcriptUrl).toBe(ninth.transcriptUrl);
  });

  it('rejects invalid video ids without falling back to the first clip', async () => {
    await expect(fetchVideoMeta('the-office-health-care-video')).rejects.toMatchObject({
      name: 'ApiError',
      code: 'VIDEO_META_NOT_FOUND',
      retryable: false,
      status: 404,
    });
  });
});
