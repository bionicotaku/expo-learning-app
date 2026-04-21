import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import {
  setPendingRestoreVideoId,
} from '@/features/feed-session';
import { useFeedSource } from '@/features/feed-source';
import { resolveVideoDetailRouteTarget } from '../model/resolve-video-detail-route-target';
import { FullscreenVideoSession } from './fullscreen-video-session';

export function VideoDetailPage() {
  const { videoId } = useLocalSearchParams<{ videoId?: string | string[] }>();
  const {
    isInitialLoading,
    items: canonicalItems,
    requestMore,
  } = useFeedSource();
  const normalizedVideoId =
    typeof videoId === 'string' ? videoId : Array.isArray(videoId) ? videoId[0] : null;
  const routeTarget = useMemo(
    () =>
      resolveVideoDetailRouteTarget({
        items: canonicalItems,
        routeVideoId: normalizedVideoId,
      }),
    [canonicalItems, normalizedVideoId]
  );
  const latestActiveItemIdRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      setPendingRestoreVideoId(latestActiveItemIdRef.current);
    };
  }, []);

  const handleLatestActiveVideoIdChange = useCallback((itemId: string) => {
    latestActiveItemIdRef.current = itemId;
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <FullscreenVideoSession
        key={routeTarget.sessionKey}
        entryIndex={routeTarget.entryIndex}
        entryVideoId={routeTarget.entryVideoId}
        isInitialLoading={isInitialLoading}
        items={canonicalItems}
        onLatestActiveVideoIdChange={handleLatestActiveVideoIdChange}
        requestMore={requestMore}
      />
    </>
  );
}
