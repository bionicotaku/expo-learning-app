import { useCallback, useRef, useState } from 'react';

import type { VideoListItem } from '@/entities/video';
import { useFullscreenTranscriptSource } from '@/features/transcript-source';
import { FullscreenVideoPager } from '@/widgets/fullscreen-video-pager';

const trailingRequestThreshold = 3;

type FullscreenPagerReportedActive = {
  itemId: string;
  index: number;
} | null;

type FullscreenVideoSessionProps = {
  entryIndex: number;
  entryVideoId: string | null;
  isInitialLoading: boolean;
  items: VideoListItem[];
  onLatestActiveVideoIdChange: (videoId: string) => void;
  requestMore: () => Promise<void>;
};

export function FullscreenVideoSession({
  entryIndex,
  entryVideoId,
  isInitialLoading,
  items,
  onLatestActiveVideoIdChange,
  requestMore,
}: FullscreenVideoSessionProps) {
  const lastRequestedTailVideoIdRef = useRef<string | null>(null);
  const [pagerReportedActive, setPagerReportedActive] =
    useState<FullscreenPagerReportedActive>(null);
  const activeTranscriptVideoId = pagerReportedActive?.itemId ?? entryVideoId;
  const activeTranscriptIndex =
    pagerReportedActive?.index ?? (entryVideoId === null ? null : entryIndex);

  useFullscreenTranscriptSource({
    activeIndex: activeTranscriptIndex,
    activeVideoId: activeTranscriptVideoId,
    items,
  });

  const handleActiveVideoChange = useCallback(
    (itemId: string, index: number) => {
      setPagerReportedActive({
        itemId,
        index,
      });
      onLatestActiveVideoIdChange(itemId);

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
    },
    [items, onLatestActiveVideoIdChange, requestMore]
  );

  return (
    <FullscreenVideoPager
      entryIndex={entryIndex}
      isInitialLoading={isInitialLoading}
      items={items}
      onActiveVideoChange={handleActiveVideoChange}
    />
  );
}
