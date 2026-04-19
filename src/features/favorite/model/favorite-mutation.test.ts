import { QueryClient } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FAVORITES_QUERY_KEY } from './favorite-query';
import {
  createSetFavoriteMutationOptions,
  createSetFavoriteStateAction,
} from './set-favorite-mutation';

describe('favorite mutation action', () => {
  it('deduplicates the same in-flight favorite operation', async () => {
    let releaseRequest!: () => void;

    const repository = {
      setFavoriteState: vi.fn(
        () =>
          new Promise<void>((resolve) => {
            releaseRequest = resolve;
          })
      ),
    };

    const action = createSetFavoriteStateAction(repository);
    const firstRequest = action({ videoId: 'video-1', value: true });
    const secondRequest = action({ videoId: 'video-1', value: true });

    expect(repository.setFavoriteState).toHaveBeenCalledTimes(1);

    releaseRequest();
    await Promise.all([firstRequest, secondRequest]);
  });
});

describe('favorite mutation options', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });
  });

  it('optimistically updates and rolls back favorites on error', async () => {
    queryClient.setQueryData<string[]>(FAVORITES_QUERY_KEY, ['video-1']);

    const runMutation = vi.fn().mockRejectedValue(new Error('boom'));
    const options = createSetFavoriteMutationOptions(queryClient, runMutation);
    const variables = {
      videoId: 'video-2',
      value: true,
    };

    const context = await options.onMutate?.(variables);

    expect(queryClient.getQueryData(FAVORITES_QUERY_KEY)).toEqual([
      'video-1',
      'video-2',
    ]);

    await options.onError?.(new Error('boom'), variables, context);

    expect(queryClient.getQueryData(FAVORITES_QUERY_KEY)).toEqual(['video-1']);
  });

  it('keeps the optimistic state and invalidates the favorites query on success', async () => {
    queryClient.setQueryData<string[]>(FAVORITES_QUERY_KEY, ['video-1']);

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const runMutation = vi.fn().mockResolvedValue(undefined);
    const options = createSetFavoriteMutationOptions(queryClient, runMutation);
    const variables = {
      videoId: 'video-2',
      value: true,
    };

    await options.onMutate?.(variables);

    await options.onSettled?.();

    expect(queryClient.getQueryData(FAVORITES_QUERY_KEY)).toEqual([
      'video-1',
      'video-2',
    ]);
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: FAVORITES_QUERY_KEY,
    });
  });
});
