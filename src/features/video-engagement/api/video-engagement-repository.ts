import {
  setMockVideoFavorited,
  setMockVideoLiked,
} from './mock-video-engagement-repository';

export type VideoEngagementWriteRequest = {
  method: 'PUT' | 'DELETE';
  path: string;
};

function createVideoEngagementRequest(
  videoId: string,
  target: boolean,
  field: 'favorite' | 'like'
): VideoEngagementWriteRequest {
  return {
    method: target ? 'PUT' : 'DELETE',
    path: `/videos/${encodeURIComponent(videoId)}/${field}`,
  };
}

export function createVideoLikeRequest(
  videoId: string,
  target: boolean
): VideoEngagementWriteRequest {
  return createVideoEngagementRequest(videoId, target, 'like');
}

export function createVideoFavoriteRequest(
  videoId: string,
  target: boolean
): VideoEngagementWriteRequest {
  return createVideoEngagementRequest(videoId, target, 'favorite');
}

export async function setVideoLiked(
  videoId: string,
  target: boolean
): Promise<void> {
  await setMockVideoLiked(videoId, target);
}

export async function setVideoFavorited(
  videoId: string,
  target: boolean
): Promise<void> {
  await setMockVideoFavorited(videoId, target);
}
