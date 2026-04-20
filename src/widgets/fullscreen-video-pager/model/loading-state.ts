export type FullscreenVideoLoadingState = {
  showInitialBottomLoader: boolean;
};

export function getFullscreenVideoLoadingState({
  itemCount,
  isInitialLoading,
}: {
  itemCount: number;
  isInitialLoading: boolean;
}): FullscreenVideoLoadingState {
  return {
    showInitialBottomLoader: isInitialLoading && itemCount === 0,
  };
}
