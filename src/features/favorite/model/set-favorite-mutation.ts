import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';

import { setFavoriteState, type SetFavoriteStateInput } from '@/entities/favorite';

import { FAVORITES_QUERY_KEY } from './favorite-query';

type FavoriteMutationContext = {
  previousFavoriteIds?: string[];
};

type SetFavoriteRepository = {
  setFavoriteState: (videoId: string, value: boolean) => Promise<void>;
};

function applyFavoriteState(currentIds: string[] | undefined, variables: SetFavoriteStateInput) {
  const nextIds = new Set(currentIds ?? []);

  if (variables.value) {
    nextIds.add(variables.videoId);
  } else {
    nextIds.delete(variables.videoId);
  }

  return Array.from(nextIds).sort();
}

function buildFavoriteOperationKey({ videoId, value }: SetFavoriteStateInput) {
  return `favorite:${videoId}:${value ? 'on' : 'off'}`;
}

export function createSetFavoriteStateAction(repository: SetFavoriteRepository) {
  const inFlightOperations = new Map<string, Promise<void>>();

  return async (variables: SetFavoriteStateInput) => {
    const operationKey = buildFavoriteOperationKey(variables);
    const existingRequest = inFlightOperations.get(operationKey);

    if (existingRequest) {
      return existingRequest;
    }

    const request = repository
      .setFavoriteState(variables.videoId, variables.value)
      .finally(() => {
        inFlightOperations.delete(operationKey);
      });

    inFlightOperations.set(operationKey, request);
    return request;
  };
}

const runSetFavoriteState = createSetFavoriteStateAction({ setFavoriteState });

export function createSetFavoriteMutationOptions(
  queryClient: QueryClient,
  mutationFn = runSetFavoriteState
) {
  return {
    mutationFn,
    onMutate: async (variables: SetFavoriteStateInput): Promise<FavoriteMutationContext> => {
      await queryClient.cancelQueries({
        queryKey: FAVORITES_QUERY_KEY,
      });

      const previousFavoriteIds = queryClient.getQueryData<string[]>(FAVORITES_QUERY_KEY);

      queryClient.setQueryData<string[]>(
        FAVORITES_QUERY_KEY,
        applyFavoriteState(previousFavoriteIds, variables)
      );

      return {
        previousFavoriteIds,
      };
    },
    onError: async (
      _error: unknown,
      _variables: SetFavoriteStateInput,
      context?: FavoriteMutationContext
    ) => {
      if (context?.previousFavoriteIds === undefined) {
        queryClient.removeQueries({
          queryKey: FAVORITES_QUERY_KEY,
          exact: true,
        });
        return;
      }

      queryClient.setQueryData<string[]>(FAVORITES_QUERY_KEY, context.previousFavoriteIds);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: FAVORITES_QUERY_KEY,
      });
    },
  };
}

export function useSetFavoriteMutation() {
  const queryClient = useQueryClient();

  return useMutation(
    createSetFavoriteMutationOptions(queryClient)
  );
}
