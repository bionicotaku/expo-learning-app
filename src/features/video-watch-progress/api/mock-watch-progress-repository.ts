import type { WatchProgressRequestBody } from '../model/types';

export async function reportMockVideoWatchProgress(
  _videoId: string,
  _body: WatchProgressRequestBody
): Promise<void> {
  return undefined;
}
