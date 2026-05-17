import type {
  WatchProgressRequestBody,
  WatchProgressWriteResponse,
} from '../model/types';

export async function reportMockVideoWatchProgress(
  _body: WatchProgressRequestBody
): Promise<WatchProgressWriteResponse> {
  return { accepted: true };
}
