export type FeedListLoadingState = {
  showFooterLoader: boolean;
};

export function getFeedListLoadingState({
  itemCount,
  isPending,
  isFetchingNextPage,
}: {
  itemCount: number;
  isPending: boolean;
  isFetchingNextPage: boolean;
}): FeedListLoadingState {
  return {
    showFooterLoader: (isPending && itemCount === 0) || (isFetchingNextPage && itemCount > 0),
  };
}
