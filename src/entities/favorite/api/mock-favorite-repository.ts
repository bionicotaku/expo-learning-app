const favoriteIds = new Set<string>();

function toSortedArray() {
  return Array.from(favoriteIds).sort();
}

export async function fetchFavoriteIds(): Promise<string[]> {
  return toSortedArray();
}

export async function setFavoriteState(videoId: string, value: boolean): Promise<void> {
  if (value) {
    favoriteIds.add(videoId);
    return;
  }

  favoriteIds.delete(videoId);
}

export function resetFavoriteStoreForTests() {
  favoriteIds.clear();
}
