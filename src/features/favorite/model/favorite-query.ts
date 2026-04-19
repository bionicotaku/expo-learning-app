import { useQuery } from '@tanstack/react-query';

import { fetchFavoriteIds } from '@/entities/favorite';

export const FAVORITES_QUERY_KEY = ['favorites', 'saved'] as const;

export function useFavoriteIdsQuery() {
  return useQuery({
    queryKey: FAVORITES_QUERY_KEY,
    queryFn: fetchFavoriteIds,
  });
}
