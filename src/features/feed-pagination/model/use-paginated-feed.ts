import { useCallback, useEffect, useRef, useState } from 'react';

import type { FeedVideoItem } from '@/entities/video';

import { fetchMockFeedPage } from './mock-feed';
import { PAGE_SIZE, shouldLoadMore } from './pagination-helpers';

export type PaginatedFeedState = {
  items: FeedVideoItem[];
  isInitialLoading: boolean;
  isAppending: boolean;
  nextOffset: number;
  hasMore: boolean;
};

const initialState: PaginatedFeedState = {
  items: [],
  isInitialLoading: true,
  isAppending: false,
  nextOffset: 0,
  hasMore: true,
};

export function usePaginatedFeed() {
  const [state, setState] = useState<PaginatedFeedState>(initialState);
  const requestInFlightRef = useRef(false);
  const stateRef = useRef(state);
  const isMountedRef = useRef(true);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadPage = useCallback(async (mode: 'initial' | 'append') => {
    if (requestInFlightRef.current) {
      return;
    }

    requestInFlightRef.current = true;
    const offset = stateRef.current.nextOffset;

    setState((previousState) => ({
      ...previousState,
      isInitialLoading: mode === 'initial',
      isAppending: mode === 'append',
    }));

    try {
      const nextItems = await fetchMockFeedPage({
        offset,
        limit: PAGE_SIZE,
      });

      if (!isMountedRef.current) {
        return;
      }

      setState((previousState) => ({
        ...previousState,
        items: [...previousState.items, ...nextItems],
        isInitialLoading: false,
        isAppending: false,
        nextOffset: previousState.nextOffset + nextItems.length,
      }));
    } finally {
      requestInFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    void loadPage('initial');
  }, [loadPage]);

  const loadMoreIfNeeded = useCallback((activeIndex: number) => {
    const snapshot = stateRef.current;

    if (snapshot.isInitialLoading) {
      return;
    }

    if (
      !shouldLoadMore({
        activeIndex,
        loadedCount: snapshot.items.length,
        isAppending: snapshot.isAppending,
        hasMore: snapshot.hasMore,
      })
    ) {
      return;
    }

    void loadPage('append');
  }, [loadPage]);

  return {
    ...state,
    loadMoreIfNeeded,
  };
}
