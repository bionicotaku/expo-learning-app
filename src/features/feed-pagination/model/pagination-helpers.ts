import type { FeedListItem, FeedVideoItem, LoadingSentinelItem } from '@/entities/video';

export const PAGE_SIZE = 10;
export const NETWORK_DELAY_MS = 3000;
export const PREFETCH_THRESHOLD = 2;

type ShouldLoadMoreArgs = {
  activeIndex: number;
  loadedCount: number;
  isAppending: boolean;
  hasMore: boolean;
  threshold?: number;
};

export function shouldLoadMore({
  activeIndex,
  loadedCount,
  isAppending,
  hasMore,
  threshold = PREFETCH_THRESHOLD,
}: ShouldLoadMoreArgs): boolean {
  if (!hasMore || isAppending || loadedCount === 0) {
    return false;
  }

  return activeIndex >= loadedCount - threshold - 1;
}

export function createLoadingSentinel(loadedCount: number): LoadingSentinelItem {
  return {
    id: `loading-sentinel-${loadedCount}`,
    kind: 'loading-sentinel',
  };
}

export function buildFeedListItems(items: FeedVideoItem[], isAppending: boolean): FeedListItem[] {
  if (!isAppending) {
    return items;
  }

  return [...items, createLoadingSentinel(items.length)];
}

export function getDebugCounterLabel(activeIndex: number, loadedCount: number): string {
  if (loadedCount === 0) {
    return '0 / 0';
  }

  return `${activeIndex + 1} / ${loadedCount}`;
}
