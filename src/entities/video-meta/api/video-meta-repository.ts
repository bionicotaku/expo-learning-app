import type { VideoMeta } from '../model/types';

import { fetchMockVideoMeta } from './mock-video-meta-repository';

export async function fetchVideoMeta(videoId: string): Promise<VideoMeta> {
  return fetchMockVideoMeta(videoId);
}
