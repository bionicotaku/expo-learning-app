import type { VideoListItem } from '@/entities/video';

type ResolveFullscreenVideoResourceTargetIdsArgs = {
  activeIndex: number | null;
  items: VideoListItem[];
};

export function resolveFullscreenVideoResourceTargetIds({
  activeIndex,
  items,
}: ResolveFullscreenVideoResourceTargetIdsArgs) {
  if (activeIndex === null || items.length === 0) {
    return [];
  }

  const seenVideoIds = new Set<string>();
  const videoIds: string[] = [];

  for (const index of [activeIndex - 1, activeIndex, activeIndex + 1]) {
    const videoId = items[index]?.videoId?.trim() ?? '';
    if (!videoId || seenVideoIds.has(videoId)) {
      continue;
    }

    seenVideoIds.add(videoId);
    videoIds.push(videoId);
  }

  return videoIds;
}
