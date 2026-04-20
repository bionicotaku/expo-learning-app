import type { FeedResponse } from '../model/types';

import { fetchMockFeed } from './mock-feed-repository';

const mockFeedDelayMs = 2000;

export async function fetchFeed(): Promise<FeedResponse> {
  return fetchMockFeed({
    delayMs: mockFeedDelayMs,
  });
}
