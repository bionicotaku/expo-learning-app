import type { VideoListItem } from './types';

export function findVideoListItemIndex(
  items: VideoListItem[],
  targetVideoId: string | null | undefined
) {
  if (!targetVideoId) {
    return -1;
  }

  return items.findIndex((item) => item.videoId === targetVideoId);
}
