import { reportMockVideoWatchProgress } from './mock-watch-progress-repository';
import type {
  WatchProgressRequestBody,
  WatchProgressWriteResponse,
  WatchProgressWriteRequest,
} from '../model/types';

const watchProgressPath = '/video-watch-progress';

export function createWatchProgressRequest(body: WatchProgressRequestBody): WatchProgressWriteRequest {
  return {
    body,
    method: 'POST',
    path: watchProgressPath,
  };
}

export async function reportVideoWatchProgress(
  body: WatchProgressRequestBody
): Promise<WatchProgressWriteResponse> {
  return reportMockVideoWatchProgress(body);
}
