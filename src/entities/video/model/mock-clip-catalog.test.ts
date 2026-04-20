import { describe, expect, it } from 'vitest';

import {
  mockClipCount,
  resolveMockClipAssetBySequenceNumber,
  resolveMockClipAssetByVideoId,
} from './mock-clip-catalog';

describe('mock clip catalog', () => {
  it('exposes the eight shared clip assets used by feed and transcript mocks', () => {
    expect(mockClipCount).toBe(8);
    expect(resolveMockClipAssetBySequenceNumber(1)).toMatchObject({
      clipNumber: 1,
      coverImageUrl:
        'https://storage.googleapis.com/videos2077/test-video/cover/The%20Office%20(US)%20(2005)%20-%20S01E03%20-%20Health%20Care%20(1080p%20BluRay%20x265%20Silence)-clip1.webp',
      transcriptUrl:
        'https://storage.googleapis.com/videos2077/test-video/transcript/The%20Office%20(US)%20(2005)%20-%20S01E03%20-%20Health%20Care%20(1080p%20BluRay%20x265%20Silence)-clip1.json',
      videoUrl:
        'https://storage.googleapis.com/videos2077/test-video/hls/The Office (US) (2005) - S01E03 - Health Care (1080p BluRay x265 Silence)-clip1_hls/playlist.m3u8',
    });
  });

  it('maps sequence numbers and video ids onto the same clip slots', () => {
    expect(resolveMockClipAssetBySequenceNumber(9)).toMatchObject({
      clipNumber: 1,
    });
    expect(resolveMockClipAssetByVideoId('the-office-health-care-video-1')).toMatchObject({
      clipNumber: 1,
    });
    expect(resolveMockClipAssetByVideoId('the-office-health-care-video-8')).toMatchObject({
      clipNumber: 8,
    });
    expect(resolveMockClipAssetByVideoId('the-office-health-care-video-9')).toMatchObject({
      clipNumber: 1,
    });
    expect(resolveMockClipAssetByVideoId('the-office-health-care-video-16')).toMatchObject({
      clipNumber: 8,
    });
  });

  it('returns null when the video id does not end with a positive integer', () => {
    expect(resolveMockClipAssetByVideoId('the-office-health-care-video')).toBeNull();
    expect(resolveMockClipAssetByVideoId('the-office-health-care-video-zero')).toBeNull();
  });
});
