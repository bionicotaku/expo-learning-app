type ViewableItemWithVideoId = {
  videoId: string;
};

type ViewableItemToken<T extends ViewableItemWithVideoId> = {
  index?: number | null;
  isViewable?: boolean;
  item?: T | null;
};

type ResolveActiveVideoChangeArgs<T extends ViewableItemWithVideoId> = {
  currentActiveIndex: number | null;
  currentActiveItemId: string | null;
  viewableItems: readonly ViewableItemToken<T>[];
};

type ActiveVideoChange = {
  index: number;
  itemId: string;
};

export function resolveActiveVideoChange<T extends ViewableItemWithVideoId>({
  currentActiveIndex,
  currentActiveItemId,
  viewableItems,
}: ResolveActiveVideoChangeArgs<T>): ActiveVideoChange | null {
  const currentItem = viewableItems.find(
    (item) =>
      item.isViewable &&
      typeof item.index === 'number' &&
      item.item !== null &&
      item.item !== undefined
  );

  if (!currentItem?.item || typeof currentItem.index !== 'number') {
    return null;
  }

  if (
    currentItem.index === currentActiveIndex &&
    currentItem.item.videoId === currentActiveItemId
  ) {
    return null;
  }

  return {
    index: currentItem.index,
    itemId: currentItem.item.videoId,
  };
}
