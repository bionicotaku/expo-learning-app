import {
  fetchFavoriteIds as fetchMockFavoriteIds,
  setFavoriteState as setMockFavoriteState,
} from './mock-favorite-repository';

export async function fetchFavoriteIds(): Promise<string[]> {
  return fetchMockFavoriteIds();
}

export async function setFavoriteState(videoId: string, value: boolean): Promise<void> {
  return setMockFavoriteState(videoId, value);
}
