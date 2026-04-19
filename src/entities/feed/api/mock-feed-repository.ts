import { VIDEO_ASSETS } from '@/entities/video';

import type { FeedItem, FeedPageResult } from '../model/types';

type CreateMockFeedPageParams = {
  offset: number;
  limit: number;
};

type FetchFeedPageParams = CreateMockFeedPageParams & {
  delayMs?: number;
};

function sleep(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

function createFeedItem(offset: number, limit: number, relativeIndex: number): FeedItem {
  const indexInFeed = offset + relativeIndex;
  const page = Math.floor(indexInFeed / limit) + 1;
  const asset = VIDEO_ASSETS[indexInFeed % VIDEO_ASSETS.length];

  return {
    id: `feed-${indexInFeed + 1}`,
    kind: 'feed-item',
    assetId: asset.assetId,
    uri: asset.uri,
    title: `Clip ${String(indexInFeed + 1).padStart(2, '0')}`,
    subtitle: `Page ${page} · ${asset.defaultSubtitle}`,
    page,
    indexInFeed,
  };
}

export function createMockFeedPage({
  offset,
  limit,
}: CreateMockFeedPageParams): FeedPageResult {
  return {
    items: Array.from({ length: limit }, (_, relativeIndex) =>
      createFeedItem(offset, limit, relativeIndex)
    ),
    nextOffset: offset + limit,
    hasMore: true,
  };
}

export async function fetchFeedPage({
  offset,
  limit,
  delayMs = 0,
}: FetchFeedPageParams): Promise<FeedPageResult> {
  await sleep(delayMs);
  return createMockFeedPage({ offset, limit });
}
