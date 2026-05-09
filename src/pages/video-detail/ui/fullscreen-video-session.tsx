import { useCallback, useRef, useState } from 'react';

import type { VideoListItem } from '@/entities/video';
import {
  usePresentPlaybackSettingsSheet,
  useSubtitleDisplayMode,
  useVideoDetailsVisible,
} from '@/features/playback-settings';
import { createTailRequestGate } from '@/features/feed-source';
import { useFullscreenVideoResources } from '@/features/fullscreen-video-resources';
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
  const tailRequestGateRef = useRef(createTailRequestGate());
  const subtitleDisplayMode = useSubtitleDisplayMode();
  const videoDetailsVisible = useVideoDetailsVisible();
  const presentPlaybackSettingsSheet = usePresentPlaybackSettingsSheet();
  const [pagerReportedActive, setPagerReportedActive] =
    useState<FullscreenPagerReportedActive>(null);
  const activeResourceVideoId = pagerReportedActive?.itemId ?? entryVideoId;
  const activeResourceIndex =
    pagerReportedActive?.index ?? (entryVideoId === null ? null : entryIndex);

  const { activeTranscript, videoMetaByVideoId } = useFullscreenVideoResources({
    activeIndex: activeResourceIndex,
    activeVideoId: activeResourceVideoId,
    items,
  });

  const requestMoreForTail = useCallback((tailVideoId: string | null) => {
    const tailRequestGate = tailRequestGateRef.current;

    if (tailVideoId === null || !tailRequestGate.canStart(tailVideoId)) {
      return;
    }

    tailRequestGate.markStarted(tailVideoId);
    void Promise.resolve(requestMore())
      .then(() => {
        tailRequestGate.markSucceeded(tailVideoId);
      })
      .catch(() => undefined)
      .finally(() => {
        tailRequestGate.markSettled(tailVideoId);
      });
  }, [requestMore]);

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

      requestMoreForTail(tailVideoId);
    },
    [items, onLatestActiveVideoIdChange, requestMoreForTail]
  );

  return (
    <FullscreenVideoPager
      activeTranscript={activeTranscript}
      entryIndex={entryIndex}
      isInitialLoading={isInitialLoading}
      items={items}
      onActiveVideoChange={handleActiveVideoChange}
      onCenterHoldStart={presentPlaybackSettingsSheet}
      subtitleDisplayMode={subtitleDisplayMode}
      videoDetailsVisible={videoDetailsVisible}
      videoMetaByVideoId={videoMetaByVideoId}
    />
  );
}
