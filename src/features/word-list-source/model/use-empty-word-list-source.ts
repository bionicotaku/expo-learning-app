import { useMemo } from 'react';

import type { WordListSourceResult } from './types';

const noopAsync = async () => {};

export function useEmptyWordListSource(): WordListSourceResult {
  return useMemo(
    () => ({
      items: [],
      error: null,
      isInitialLoading: false,
      isRefreshing: false,
      isExtending: false,
      refresh: noopAsync,
      requestMore: noopAsync,
    }),
    []
  );
}
