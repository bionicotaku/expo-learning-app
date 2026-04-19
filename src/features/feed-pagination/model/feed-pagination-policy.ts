export const PAGE_SIZE = 10;
export const NETWORK_DELAY_MS = 3000;
export const PREFETCH_THRESHOLD = 2;

type ShouldPrefetchNextPageArgs = {
  activeIndex: number;
  loadedCount: number;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  threshold?: number;
};

export function shouldPrefetchNextPage({
  activeIndex,
  loadedCount,
  isFetchingNextPage,
  hasNextPage,
  threshold = PREFETCH_THRESHOLD,
}: ShouldPrefetchNextPageArgs): boolean {
  if (!hasNextPage || isFetchingNextPage || loadedCount === 0) {
    return false;
  }

  return activeIndex >= loadedCount - threshold - 1;
}
