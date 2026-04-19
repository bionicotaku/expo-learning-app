import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import {
  setPendingRestoreVideoId,
} from '@/features/feed-session';
import {
  findFeedItemIndex,
  flattenFeedPages,
  shouldPrefetchNextPage,
  useFeedInfiniteQuery,
} from '@/features/feed-pagination';
import { FullscreenVideoPager } from '@/widgets/fullscreen-video-pager';

export function VideoDetailPage() {
  const { videoId } = useLocalSearchParams<{ videoId?: string | string[] }>();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
  } = useFeedInfiniteQuery();
  const items = useMemo(() => flattenFeedPages(data), [data]);
  const normalizedVideoId =
    typeof videoId === 'string' ? videoId : Array.isArray(videoId) ? videoId[0] : null;
  const targetIndex = useMemo(
    () => findFeedItemIndex(items, normalizedVideoId),
    [items, normalizedVideoId]
  );
  const latestActiveItemIdRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      setPendingRestoreVideoId(latestActiveItemIdRef.current);
    };
  }, []);

  const handleActiveItemChange = useCallback(
    (itemId: string, index: number) => {
      latestActiveItemIdRef.current = itemId;

      if (
        !shouldPrefetchNextPage({
          activeIndex: index,
          loadedCount: items.length,
          isFetchingNextPage,
          hasNextPage: hasNextPage ?? false,
        })
      ) {
        return;
      }

      void fetchNextPage();
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage, items.length]
  );

  return (
    <>
      <StatusBar style="light" />
      <FullscreenVideoPager
        initialIndex={targetIndex >= 0 ? targetIndex : 0}
        isFetchingNextPage={isFetchingNextPage}
        isInitialLoading={isPending && items.length === 0}
        items={items}
        onActiveItemChange={handleActiveItemChange}
      />
    </>
  );
}
