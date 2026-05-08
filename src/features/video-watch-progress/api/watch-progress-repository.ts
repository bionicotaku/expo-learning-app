import { reportMockVideoWatchProgress } from './mock-watch-progress-repository';
import type {
  WatchProgressRequestBody,
  WatchProgressWriteRequest,
} from '../model/types';

export function createWatchProgressRequest(
  videoId: string,
  body: WatchProgressRequestBody
): WatchProgressWriteRequest {
  return {
    body,
    method: 'POST',
    path: `/catalog/videos/${encodeURIComponent(videoId)}/watch-progress`,
  };
}

export async function reportVideoWatchProgress(
  videoId: string,
  body: WatchProgressRequestBody
): Promise<void> {
  await reportMockVideoWatchProgress(videoId, body);
}
