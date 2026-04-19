import type { FeedPageResult } from '../model/types';

import { fetchMockFeedPage } from './mock-feed-repository';

export type FetchFeedPageParams = {
  offset: number;
  limit: number;
  delayMs?: number;
};

export async function fetchFeedPage({
  offset,
  limit,
  delayMs = 0,
}: FetchFeedPageParams): Promise<FeedPageResult> {
  return fetchMockFeedPage({
    offset,
    limit,
    delayMs,
  });
}
