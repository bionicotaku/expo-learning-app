import { resolveMockClipAssetByVideoId } from '@/entities/video/model/mock-clip-catalog';
import { ApiError } from '@/shared/api';

function assertMockVideoExists(videoId: string) {
  if (resolveMockClipAssetByVideoId(videoId)) {
    return;
  }

  throw new ApiError(`Video engagement was not found for videoId ${videoId}`, {
    code: 'VIDEO_ENGAGEMENT_NOT_FOUND',
    retryable: false,
    status: 404,
  });
}

export async function setMockVideoLiked(
  videoId: string,
  _target: boolean
): Promise<void> {
  assertMockVideoExists(videoId);
}

export async function setMockVideoFavorited(
  videoId: string,
  _target: boolean
): Promise<void> {
  assertMockVideoExists(videoId);
}
