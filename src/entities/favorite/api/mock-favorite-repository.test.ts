import { beforeEach, describe, expect, it } from 'vitest';

import {
  fetchFavoriteIds,
  resetFavoriteStoreForTests,
  setFavoriteState,
} from './mock-favorite-repository';

describe('mock favorite repository', () => {
  beforeEach(() => {
    resetFavoriteStoreForTests();
  });

  it('returns the current favorite ids', async () => {
    await setFavoriteState('video-2', true);
    await setFavoriteState('video-1', true);

    await expect(fetchFavoriteIds()).resolves.toEqual(['video-1', 'video-2']);
  });

  it('allows setting the same favorite state repeatedly without duplication', async () => {
    await setFavoriteState('video-1', true);
    await setFavoriteState('video-1', true);

    await expect(fetchFavoriteIds()).resolves.toEqual(['video-1']);
  });

  it('allows removing a favorite that is not currently stored', async () => {
    await expect(setFavoriteState('video-1', false)).resolves.toBeUndefined();
    await expect(fetchFavoriteIds()).resolves.toEqual([]);
  });
});
