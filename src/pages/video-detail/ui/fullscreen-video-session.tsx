import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect, useIsFocused } from 'expo-router';

import type { VideoListItem } from '@/entities/video';
import {
  usePresentPlaybackSettingsSheet,
  useSubtitleDisplayMode,
  useVideoDetailsVisible,
} from '@/features/playback-settings';
import { createTailRequestGate } from '@/features/feed-source';
import { useFullscreenVideoResources } from '@/features/fullscreen-video-resources';
import { useVideoEndQuiz } from '@/features/video-end-quiz';
import { useVideoWatchProgressReporter } from '@/features/video-watch-progress';
import {
  FullscreenVideoPager,
  type FullscreenWatchProgressSample,
} from '@/widgets/fullscreen-video-pager';

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
  const { prefetchEndQuizForVideo, presentEndQuizBeforeAdvance } =
    useVideoEndQuiz();
  const { flush, reportSample } = useVideoWatchProgressReporter();
  const isScreenFocused = useIsFocused();
  const latestEndQuizActiveVideoIdRef = useRef<string | null>(entryVideoId);
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

  useEffect(() => {
    if (entryVideoId === null || pagerReportedActive !== null) {
      return;
    }

    const entryItem =
      items[entryIndex]?.videoId === entryVideoId
        ? items[entryIndex]
        : items.find((item) => item.videoId === entryVideoId);

    if (!entryItem) {
      return;
    }

    latestEndQuizActiveVideoIdRef.current = entryItem.videoId;
    void prefetchEndQuizForVideo(entryItem, {
      shouldToastFailure: () =>
        latestEndQuizActiveVideoIdRef.current === entryItem.videoId,
    });
  }, [
    entryIndex,
    entryVideoId,
    items,
    pagerReportedActive,
    prefetchEndQuizForVideo,
  ]);

  useFocusEffect(
    useCallback(() => {
      const interval = setInterval(() => {
        void flush();
      }, 10_000);

      return () => {
        clearInterval(interval);
        void flush();
      };
    }, [flush])
  );

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
      void flush();
      setPagerReportedActive({
        itemId,
        index,
      });
      onLatestActiveVideoIdChange(itemId);

      const activeItem = items[index];
      if (activeItem) {
        latestEndQuizActiveVideoIdRef.current = activeItem.videoId;
        void prefetchEndQuizForVideo(activeItem, {
          shouldToastFailure: () =>
            latestEndQuizActiveVideoIdRef.current === activeItem.videoId,
        });
      }

      const tailVideoId = items[items.length - 1]?.videoId ?? null;
      if (!tailVideoId) {
        return;
      }

      if (index < Math.max(0, items.length - trailingRequestThreshold)) {
        return;
      }

      requestMoreForTail(tailVideoId);
    },
    [
      flush,
      items,
      onLatestActiveVideoIdChange,
      prefetchEndQuizForVideo,
      requestMoreForTail,
    ]
  );

  const handleWatchProgressSample = useCallback(
    ({
      playbackRate,
      snapshot,
      videoId,
      watchSessionId,
    }: FullscreenWatchProgressSample) => {
      reportSample({
        currentTimeSeconds: snapshot.currentTimeSeconds,
        durationSeconds: snapshot.durationSeconds,
        playbackRate,
        videoId,
        watchSessionId,
      });
    },
    [reportSample]
  );

  return (
    <FullscreenVideoPager
      activeTranscript={activeTranscript}
      entryIndex={entryIndex}
      isInitialLoading={isInitialLoading}
      isScreenFocused={isScreenFocused}
      items={items}
      onActiveVideoChange={handleActiveVideoChange}
      onBeforeAdvanceFromVideoEnd={presentEndQuizBeforeAdvance}
      onCenterHoldStart={presentPlaybackSettingsSheet}
      onWatchProgressSample={handleWatchProgressSample}
      subtitleDisplayMode={subtitleDisplayMode}
      videoDetailsVisible={videoDetailsVisible}
      videoMetaByVideoId={videoMetaByVideoId}
    />
  );
}
