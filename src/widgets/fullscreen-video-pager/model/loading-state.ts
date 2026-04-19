export type FullscreenVideoLoadingState = {
  showInitialBottomLoader: boolean;
  showPaginationBottomLoader: boolean;
};

export function getFullscreenVideoLoadingState({
  itemCount,
  isFetchingNextPage,
  isInitialLoading,
}: {
  itemCount: number;
  isFetchingNextPage: boolean;
  isInitialLoading: boolean;
}): FullscreenVideoLoadingState {
  return {
    showInitialBottomLoader: isInitialLoading && itemCount === 0,
    showPaginationBottomLoader: isFetchingNextPage && itemCount > 0,
  };
}
