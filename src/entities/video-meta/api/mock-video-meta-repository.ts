import { resolveMockClipAssetByVideoId } from '@/entities/video/model/mock-clip-catalog';
import { ApiError } from '@/shared/api';

import type { VideoMeta } from '../model/types';

function hashString(value: string): number {
  let hash = 5381;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }

  return Math.abs(hash >>> 0);
}

function buildUserBoolean(videoId: string, salt: string): boolean {
  return hashString(`${videoId}:${salt}`) % 2 === 0;
}

export async function fetchMockVideoMeta(videoId: string): Promise<VideoMeta> {
  const clipAsset = resolveMockClipAssetByVideoId(videoId);

  if (!clipAsset) {
    throw new ApiError(`Video meta was not found for videoId ${videoId}`, {
      code: 'VIDEO_META_NOT_FOUND',
      retryable: false,
      status: 404,
    });
  }

  return {
    videoId,
    isLiked: buildUserBoolean(videoId, 'liked'),
    isFavorited: buildUserBoolean(videoId, 'favorited'),
    transcriptUrl: clipAsset.transcriptUrl,
  };
}
