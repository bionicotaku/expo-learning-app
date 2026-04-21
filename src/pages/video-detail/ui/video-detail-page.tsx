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
  const latestRestoreVideoIdRef = useRef<string | null>(null);
  const seededSessionKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (seededSessionKeyRef.current !== routeTarget.sessionKey) {
      seededSessionKeyRef.current = routeTarget.sessionKey;
      latestRestoreVideoIdRef.current = routeTarget.entryVideoId;
      return;
    }

    if (
      latestRestoreVideoIdRef.current === null &&
      routeTarget.entryVideoId !== null
    ) {
      latestRestoreVideoIdRef.current = routeTarget.entryVideoId;
    }
  }, [routeTarget.entryVideoId, routeTarget.sessionKey]);

  useEffect(() => {
    return () => {
      setPendingRestoreVideoId(latestRestoreVideoIdRef.current);
    };
  }, []);

  const handleLatestActiveVideoIdChange = useCallback((itemId: string) => {
    latestRestoreVideoIdRef.current = itemId;
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
