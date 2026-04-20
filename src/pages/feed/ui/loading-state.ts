export type FeedListLoadingState =
  | { kind: 'initial-loading' }
  | { kind: 'error' }
  | { kind: 'empty' }
  | { kind: 'success'; showFooterLoader: boolean };

export function getFeedListLoadingState({
  isPending,
  hasItems,
  hasError,
  isExtending,
}: {
  isPending: boolean;
  hasItems: boolean;
  hasError: boolean;
  isExtending: boolean;
}): FeedListLoadingState {
  if (hasItems) {
    return {
      kind: 'success',
      showFooterLoader: isExtending,
    };
  }

  if (isPending) {
    return { kind: 'initial-loading' };
  }

  if (hasError) {
    return { kind: 'error' };
  }

  return { kind: 'empty' };
}
