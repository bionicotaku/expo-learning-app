import { useEffect, useMemo, useReducer } from 'react';

import {
  shouldPrefetchNextPage,
  useFeedInfiniteQuery,
} from '@/features/feed-pagination';
import {
  createFeedPlaybackState,
  feedPlaybackReducer,
} from '@/features/video-playback';
import type {
  VideoFeedOverlayModel,
  VideoFeedRenderItem,
} from '@/widgets/video-feed/model';

import {
  buildFeedScreenItems,
  getFeedDebugLabel,
  getFeedOverlayModel,
} from './feed-screen-selectors';

type FeedScreenController = {
  activeIndex: number;
  activeItemId: string | null;
  debugLabel: string;
  isInitialLoading: boolean;
  isMuted: boolean;
  items: VideoFeedRenderItem[];
  overlayModel: VideoFeedOverlayModel | null;
  setActiveItem: (itemId: string, index: number) => void;
  toggleMuted: () => void;
};

export function useFeedScreenController(): FeedScreenController {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
  } = useFeedInfiniteQuery();
  const [playbackState, dispatch] = useReducer(
    feedPlaybackReducer,
    undefined,
    createFeedPlaybackState
  );

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data]
  );
  const renderItems = useMemo(
    () => buildFeedScreenItems(items, isFetchingNextPage),
    [items, isFetchingNextPage]
  );

  useEffect(() => {
    const currentItem = renderItems[playbackState.activeIndex];

    if (!currentItem || currentItem.id === playbackState.activeItemId) {
      return;
    }

    dispatch({
      type: 'set-active-item',
      itemId: currentItem.id,
      index: playbackState.activeIndex,
    });
  }, [playbackState.activeIndex, playbackState.activeItemId, renderItems]);

  useEffect(() => {
    if (
      !shouldPrefetchNextPage({
        activeIndex: playbackState.activeIndex,
        loadedCount: items.length,
        isFetchingNextPage,
        hasNextPage: hasNextPage ?? false,
      })
    ) {
      return;
    }

    void fetchNextPage();
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    items.length,
    playbackState.activeIndex,
  ]);

  const activeRenderItem = renderItems[playbackState.activeIndex] ?? null;
  const overlayModel = activeRenderItem
    ? getFeedOverlayModel(activeRenderItem, playbackState.isMuted)
    : null;

  return {
    activeIndex: playbackState.activeIndex,
    activeItemId: playbackState.activeItemId,
    debugLabel: getFeedDebugLabel(playbackState.activeIndex, items.length),
    isInitialLoading: isPending && items.length === 0,
    isMuted: playbackState.isMuted,
    items: renderItems,
    overlayModel,
    setActiveItem: (itemId, index) => {
      dispatch({
        type: 'set-active-item',
        itemId,
        index,
      });
    },
    toggleMuted: () => {
      dispatch({ type: 'toggle-muted' });
    },
  };
}
