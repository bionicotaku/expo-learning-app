import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  setPendingRestoreVideoId,
} from '@/features/feed-session';
import {
  findVideoListItemIndex,
} from '@/entities/video';
import { useFeedSource } from '@/features/feed-source';
import { useFullscreenTranscriptSource } from '@/features/transcript-source';
import { FullscreenVideoPager } from '@/widgets/fullscreen-video-pager';

const trailingRequestThreshold = 3;

export function VideoDetailPage() {
  const { videoId } = useLocalSearchParams<{ videoId?: string | string[] }>();
  const {
    isInitialLoading,
    items: canonicalItems,
    requestMore,
  } = useFeedSource();
  const normalizedVideoId =
    typeof videoId === 'string' ? videoId : Array.isArray(videoId) ? videoId[0] : null;
  const targetIndex = useMemo(
    () => findVideoListItemIndex(canonicalItems, normalizedVideoId),
    [canonicalItems, normalizedVideoId]
  );
  const initialActiveIndex = targetIndex >= 0 ? targetIndex : 0;
  const initialActiveVideoId = canonicalItems[initialActiveIndex]?.videoId ?? null;
  const latestActiveItemIdRef = useRef<string | null>(null);
  const lastRequestedTailVideoIdRef = useRef<string | null>(null);
  const [activeTranscriptVideoId, setActiveTranscriptVideoId] = useState<string | null>(null);
  const [activeTranscriptIndex, setActiveTranscriptIndex] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      setPendingRestoreVideoId(latestActiveItemIdRef.current);
    };
  }, []);

  useEffect(() => {
    if (activeTranscriptVideoId !== null || activeTranscriptIndex !== null) {
      return;
    }

    if (initialActiveVideoId === null) {
      return;
    }

    setActiveTranscriptVideoId(initialActiveVideoId);
    setActiveTranscriptIndex(initialActiveIndex);
  }, [
    activeTranscriptIndex,
    activeTranscriptVideoId,
    initialActiveIndex,
    initialActiveVideoId,
  ]);

  useFullscreenTranscriptSource({
    activeIndex: activeTranscriptIndex,
    activeVideoId: activeTranscriptVideoId,
    items: canonicalItems,
  });

  const handleActiveItemChange = useCallback((itemId: string, index: number) => {
    latestActiveItemIdRef.current = itemId;
    setActiveTranscriptVideoId(itemId);
    setActiveTranscriptIndex(index);

    const tailVideoId = canonicalItems[canonicalItems.length - 1]?.videoId ?? null;
    if (!tailVideoId) {
      return;
    }

    if (index < Math.max(0, canonicalItems.length - trailingRequestThreshold)) {
      return;
    }

    if (tailVideoId === lastRequestedTailVideoIdRef.current) {
      return;
    }

    lastRequestedTailVideoIdRef.current = tailVideoId;
    void requestMore();
  }, [canonicalItems, requestMore]);

  return (
    <>
      <StatusBar style="light" />
      <FullscreenVideoPager
        initialIndex={initialActiveIndex}
        isInitialLoading={isInitialLoading}
        items={canonicalItems}
        onActiveItemChange={handleActiveItemChange}
      />
    </>
  );
}
