import type { VideoListItem } from '@/entities/video';

type ResolveTranscriptPrefetchVideoIdsArgs = {
  activeIndex: number | null;
  items: VideoListItem[];
};

export function resolveTranscriptPrefetchVideoIds({
  activeIndex,
  items,
}: ResolveTranscriptPrefetchVideoIdsArgs) {
  if (activeIndex === null || items.length === 0) {
    return [];
  }

  const activeVideoId = items[activeIndex]?.videoId ?? null;
  const candidateIndexes = [activeIndex - 1, activeIndex + 1];
  const seenVideoIds = new Set<string>();
  const videoIds: string[] = [];

  for (const index of candidateIndexes) {
    const videoId = items[index]?.videoId?.trim() ?? '';
    if (!videoId || videoId === activeVideoId || seenVideoIds.has(videoId)) {
      continue;
    }

    seenVideoIds.add(videoId);
    videoIds.push(videoId);
  }

  return videoIds;
}
