import { VIDEO_ASSETS } from '@/entities/video';
import type { FeedVideoItem } from '@/entities/video';

import { NETWORK_DELAY_MS, PAGE_SIZE } from './pagination-helpers';

type CreateMockFeedPageParams = {
  offset: number;
  limit?: number;
};

type FetchMockFeedPageParams = CreateMockFeedPageParams & {
  delayMs?: number;
};

function sleep(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

export function createMockFeedPage({
  offset,
  limit = PAGE_SIZE,
}: CreateMockFeedPageParams): FeedVideoItem[] {
  return Array.from({ length: limit }, (_, relativeIndex) => {
    const indexInFeed = offset + relativeIndex;
    const page = Math.floor(indexInFeed / limit) + 1;
    const asset = VIDEO_ASSETS[indexInFeed % VIDEO_ASSETS.length];

    return {
      id: `feed-${indexInFeed + 1}`,
      kind: 'video',
      assetId: asset.assetId,
      uri: asset.uri,
      title: `Clip ${String(indexInFeed + 1).padStart(2, '0')}`,
      subtitle: `Page ${page} · ${asset.defaultSubtitle}`,
      page,
      indexInFeed,
    };
  });
}

export async function fetchMockFeedPage({
  offset,
  limit = PAGE_SIZE,
  delayMs = NETWORK_DELAY_MS,
}: FetchMockFeedPageParams): Promise<FeedVideoItem[]> {
  await sleep(delayMs);
  return createMockFeedPage({ offset, limit });
}
