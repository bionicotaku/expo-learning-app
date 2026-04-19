import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';

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
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const latestActiveItemIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (items.length === 0 || activeIndex !== null) {
      return;
    }

    const nextIndex = targetIndex >= 0 ? targetIndex : 0;
    const nextItem = items[nextIndex];
    if (!nextItem) {
      return;
    }

    setActiveIndex(nextIndex);
    setActiveItemId(nextItem.id);
    latestActiveItemIdRef.current = nextItem.id;
  }, [activeIndex, targetIndex, items]);

  useEffect(() => {
    if (activeItemId) {
      latestActiveItemIdRef.current = activeItemId;
    }
  }, [activeItemId]);

  useEffect(() => {
    return () => {
      setPendingRestoreVideoId(latestActiveItemIdRef.current);
    };
  }, []);

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    if (
      !shouldPrefetchNextPage({
        activeIndex,
        loadedCount: items.length,
        isFetchingNextPage,
        hasNextPage: hasNextPage ?? false,
      })
    ) {
      return;
    }

    void fetchNextPage();
  }, [activeIndex, fetchNextPage, hasNextPage, isFetchingNextPage, items.length]);

  return (
    <>
      <StatusBar style="light" />
      <FullscreenVideoPager
        activeIndex={activeIndex}
        activeItemId={activeItemId}
        targetIndex={targetIndex >= 0 ? targetIndex : 0}
        isFetchingNextPage={isFetchingNextPage}
        isInitialLoading={isPending && items.length === 0}
        isMuted={isMuted}
        items={items}
        onSetActiveItem={(itemId, index) => {
          latestActiveItemIdRef.current = itemId;
          setActiveIndex(index);
          setActiveItemId(itemId);
        }}
        onToggleMuted={() => {
          setIsMuted((current) => !current);
        }}
      />
    </>
  );
}
