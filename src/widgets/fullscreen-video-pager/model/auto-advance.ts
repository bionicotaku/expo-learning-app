export function resolveNextFullscreenVideoIndex({
  activeIndex,
  itemCount,
}: {
  activeIndex: number | null;
  itemCount: number;
}): number | null {
  if (activeIndex === null) {
    return null;
  }

  const nextIndex = activeIndex + 1;
  return nextIndex < itemCount ? nextIndex : null;
}
