import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import {
  setPendingRestoreVideoId,
} from '@/features/feed-session';
import {
  findFeedItemIndex,
  useFeedSource,
} from '@/features/feed-source';
import { FullscreenVideoPager } from '@/widgets/fullscreen-video-pager';

const trailingRequestThreshold = 3;

export function VideoDetailPage() {
  const { videoId } = useLocalSearchParams<{ videoId?: string | string[] }>();
  const {
    isInitialLoading,
    items,
    requestMore,
  } = useFeedSource();
  const normalizedVideoId =
    typeof videoId === 'string' ? videoId : Array.isArray(videoId) ? videoId[0] : null;
  const targetIndex = useMemo(
    () => findFeedItemIndex(items, normalizedVideoId),
    [items, normalizedVideoId]
  );
  const latestActiveItemIdRef = useRef<string | null>(null);
  const lastRequestedTailVideoIdRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      setPendingRestoreVideoId(latestActiveItemIdRef.current);
    };
  }, []);

  const handleActiveItemChange = useCallback((itemId: string, index: number) => {
    latestActiveItemIdRef.current = itemId;

    const tailVideoId = items[items.length - 1]?.videoId ?? null;
    if (!tailVideoId) {
      return;
    }

    if (index < Math.max(0, items.length - trailingRequestThreshold)) {
      return;
    }

    if (tailVideoId === lastRequestedTailVideoIdRef.current) {
      return;
    }

    lastRequestedTailVideoIdRef.current = tailVideoId;
    void requestMore();
  }, [items, requestMore]);

  return (
    <>
      <StatusBar style="light" />
      <FullscreenVideoPager
        initialIndex={targetIndex >= 0 ? targetIndex : 0}
        isInitialLoading={isInitialLoading}
        items={items}
        onActiveItemChange={handleActiveItemChange}
      />
    </>
  );
}
