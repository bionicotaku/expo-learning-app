import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
  const router = useRouter();
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
  const [isMuted, setIsMuted] = useState(true);
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

  const handleToggleMuted = useCallback(() => {
    setIsMuted((current) => !current);
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <>
      <StatusBar style="light" />
      <FullscreenVideoPager
        initialIndex={targetIndex >= 0 ? targetIndex : 0}
        isFetchingNextPage={isFetchingNextPage}
        isInitialLoading={isPending && items.length === 0}
        isMuted={isMuted}
        items={items}
        onActiveItemChange={handleActiveItemChange}
        onPressBack={handleBack}
        onToggleMuted={handleToggleMuted}
      />
    </>
  );
}
