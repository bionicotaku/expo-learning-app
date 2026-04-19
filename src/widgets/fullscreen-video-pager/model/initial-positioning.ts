type ResolveInitialFullscreenPagerPositionArgs = {
  initialIndex: number;
  itemCount: number;
  mountedWithItems: boolean;
  hasCompletedPostLoadAlignment: boolean;
};

type InitialFullscreenPagerPosition = {
  initialScrollIndex: number | undefined;
  targetIndex: number;
  shouldRunPostLoadAlignment: boolean;
};

function clampInitialIndex(initialIndex: number, itemCount: number): number {
  if (itemCount <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(initialIndex, itemCount - 1));
}

export function resolveInitialFullscreenPagerPosition({
  initialIndex,
  itemCount,
  mountedWithItems,
  hasCompletedPostLoadAlignment,
}: ResolveInitialFullscreenPagerPositionArgs): InitialFullscreenPagerPosition {
  const targetIndex = clampInitialIndex(initialIndex, itemCount);
  const initialScrollIndex = mountedWithItems && itemCount > 0 ? targetIndex : undefined;
  const shouldRunPostLoadAlignment =
    !mountedWithItems && itemCount > 0 && !hasCompletedPostLoadAlignment;

  return {
    initialScrollIndex,
    targetIndex,
    shouldRunPostLoadAlignment,
  };
}
