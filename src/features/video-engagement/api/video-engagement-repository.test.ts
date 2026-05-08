import { describe, expect, it } from 'vitest';

import {
  createVideoFavoriteRequest,
  createVideoLikeRequest,
  setVideoFavorited,
  setVideoLiked,
} from './video-engagement-repository';

describe('video engagement repository', () => {
  it('resolves like write methods from the target state', () => {
    expect(createVideoLikeRequest('video-1', true)).toEqual({
      method: 'PUT',
      path: '/videos/video-1/like',
    });
    expect(createVideoLikeRequest('video-1', false)).toEqual({
      method: 'DELETE',
      path: '/videos/video-1/like',
    });
  });

  it('resolves favorite write methods from the target state', () => {
    expect(createVideoFavoriteRequest('video-1', true)).toEqual({
      method: 'PUT',
      path: '/videos/video-1/favorite',
    });
    expect(createVideoFavoriteRequest('video-1', false)).toEqual({
      method: 'DELETE',
      path: '/videos/video-1/favorite',
    });
  });

  it('resolves like and favorite writes for valid mock video ids', async () => {
    await expect(
      setVideoLiked('the-office-health-care-video-1', true)
    ).resolves.toBeUndefined();
    await expect(
      setVideoLiked('the-office-health-care-video-1', false)
    ).resolves.toBeUndefined();
    await expect(
      setVideoFavorited('the-office-health-care-video-1', true)
    ).resolves.toBeUndefined();
    await expect(
      setVideoFavorited('the-office-health-care-video-1', false)
    ).resolves.toBeUndefined();
  });

  it('rejects engagement writes for invalid mock video ids', async () => {
    await expect(setVideoLiked('the-office-health-care-video', true)).rejects.toMatchObject({
      name: 'ApiError',
      code: 'VIDEO_ENGAGEMENT_NOT_FOUND',
      status: 404,
    });
    await expect(setVideoFavorited('the-office-health-care-video', true)).rejects.toMatchObject({
      name: 'ApiError',
      code: 'VIDEO_ENGAGEMENT_NOT_FOUND',
      status: 404,
    });
  });
});
