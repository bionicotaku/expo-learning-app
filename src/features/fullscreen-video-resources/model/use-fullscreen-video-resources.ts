import { useEffect, useMemo, useRef } from 'react';
import { useQueries } from '@tanstack/react-query';

import { fetchTranscriptAsset, type Transcript } from '@/entities/transcript';
import { fetchVideoMeta, type VideoMeta } from '@/entities/video-meta';
import type { VideoListItem } from '@/entities/video';
import { toast } from '@/shared/lib/toast';

import { getTranscriptAssetQueryKey, getVideoMetaQueryKey } from './fullscreen-video-resource-query';
import { resolveFullscreenVideoResourceTargetIds } from './fullscreen-video-resource-targets';

type UseFullscreenVideoResourcesArgs = {
  activeVideoId: string | null;
  activeIndex: number | null;
  items: VideoListItem[];
};

type FullscreenVideoResourceStatus = 'idle' | 'loading' | 'success' | 'error';

type FullscreenVideoResourcesResult = {
  activeTranscript: Transcript | null;
  activeTranscriptStatus: FullscreenVideoResourceStatus;
  activeVideoMeta: VideoMeta | null;
  activeVideoMetaStatus: FullscreenVideoResourceStatus;
  videoMetaByVideoId: ReadonlyMap<string, VideoMeta>;
};

function shouldRefetchFailedQueryOnMount(query: { state: { status: string } }) {
  return query.state.status === 'error';
}

function createVideoMetaQueryOptions(videoId: string) {
  return {
    queryKey: getVideoMetaQueryKey(videoId),
    queryFn: () => fetchVideoMeta(videoId),
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: shouldRefetchFailedQueryOnMount,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
  };
}

function createTranscriptAssetQueryOptions(transcriptUrl: string) {
  return {
    queryKey: getTranscriptAssetQueryKey(transcriptUrl),
    queryFn: () => fetchTranscriptAsset(transcriptUrl),
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: shouldRefetchFailedQueryOnMount,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
  };
}

function resolveQueryStatus(
  query: { data: unknown; isError: boolean } | null
): FullscreenVideoResourceStatus {
  if (query === null) {
    return 'idle';
  }

  if (query.isError) {
    return 'error';
  }

  if (query.data) {
    return 'success';
  }

  return 'loading';
}

function getQueryFailureMarker(query: { errorUpdatedAt: number; failureCount: number }) {
  return `${query.errorUpdatedAt}:${query.failureCount}`;
}

export function useFullscreenVideoResources({
  activeVideoId,
  activeIndex,
  items,
}: UseFullscreenVideoResourcesArgs): FullscreenVideoResourcesResult {
  const toastedFailureMarkersByKeyRef = useRef(new Map<string, string>());
  const targetVideoIds = useMemo(
    () =>
      resolveFullscreenVideoResourceTargetIds({
        activeIndex,
        items,
      }),
    [activeIndex, items]
  );
  const metaQueries = useQueries({
    queries: targetVideoIds.map(createVideoMetaQueryOptions),
  });
  useEffect(() => {
    metaQueries.forEach((query, index) => {
      const videoId = targetVideoIds[index];
      if (!videoId) {
        return;
      }

      const failureKey = `video-meta:${videoId}`;
      if (query.isError) {
        const failureMarker = getQueryFailureMarker(query);
        if (toastedFailureMarkersByKeyRef.current.get(failureKey) === failureMarker) {
          return;
        }

        toastedFailureMarkersByKeyRef.current.set(failureKey, failureMarker);
        toast.show({
          kind: 'error',
          title: '视频数据获取失败',
        });
        return;
      }

      if (query.data) {
        toastedFailureMarkersByKeyRef.current.delete(failureKey);
      }
    });
  }, [metaQueries, targetVideoIds]);
  const videoMetaByVideoId = useMemo(() => {
    const nextVideoMetaByVideoId = new Map<string, VideoMeta>();

    metaQueries.forEach((query, index) => {
      const videoId = targetVideoIds[index];
      if (!videoId || !query.data) {
        return;
      }

      nextVideoMetaByVideoId.set(videoId, query.data);
    });

    return nextVideoMetaByVideoId;
  }, [metaQueries, targetVideoIds]);
  const transcriptUrls = useMemo(() => {
    const seenTranscriptUrls = new Set<string>();
    const nextTranscriptUrls: string[] = [];

    for (const query of metaQueries) {
      const transcriptUrl = query.data?.transcriptUrl ?? null;
      if (transcriptUrl !== null && !seenTranscriptUrls.has(transcriptUrl)) {
        seenTranscriptUrls.add(transcriptUrl);
        nextTranscriptUrls.push(transcriptUrl);
      }
    }

    return nextTranscriptUrls;
  }, [metaQueries]);
  const transcriptQueries = useQueries({
    queries: transcriptUrls.map(createTranscriptAssetQueryOptions),
  });
  useEffect(() => {
    transcriptQueries.forEach((query, index) => {
      const transcriptUrl = transcriptUrls[index];
      if (!transcriptUrl) {
        return;
      }

      const failureKey = `transcript-asset:${transcriptUrl}`;
      if (query.isError) {
        const failureMarker = getQueryFailureMarker(query);
        if (toastedFailureMarkersByKeyRef.current.get(failureKey) === failureMarker) {
          return;
        }

        toastedFailureMarkersByKeyRef.current.set(failureKey, failureMarker);
        toast.show({
          kind: 'error',
          title: '字幕获取失败',
        });
        return;
      }

      if (query.data) {
        toastedFailureMarkersByKeyRef.current.delete(failureKey);
      }
    });
  }, [transcriptQueries, transcriptUrls]);
  const activeVideoMetaIndex =
    activeVideoId === null ? -1 : targetVideoIds.indexOf(activeVideoId);
  const activeVideoMetaQuery =
    activeVideoMetaIndex < 0 ? null : (metaQueries[activeVideoMetaIndex] ?? null);
  const activeVideoMeta =
    activeVideoId === null ? null : (videoMetaByVideoId.get(activeVideoId) ?? null);
  const activeTranscriptUrl = activeVideoMeta?.transcriptUrl ?? null;
  const activeTranscriptIndex =
    activeTranscriptUrl === null ? -1 : transcriptUrls.indexOf(activeTranscriptUrl);
  const activeTranscriptQuery =
    activeTranscriptIndex < 0 ? null : (transcriptQueries[activeTranscriptIndex] ?? null);
  const activeVideoMetaStatus =
    activeVideoId === null ? 'idle' : resolveQueryStatus(activeVideoMetaQuery);
  const activeTranscriptStatus =
    activeVideoMetaStatus === 'loading'
      ? 'loading'
      : activeTranscriptUrl === null
        ? 'idle'
        : resolveQueryStatus(activeTranscriptQuery);

  return {
    activeTranscript:
      activeTranscriptQuery?.data && activeTranscriptUrl !== null
        ? activeTranscriptQuery.data
        : null,
    activeTranscriptStatus,
    activeVideoMeta,
    activeVideoMetaStatus,
    videoMetaByVideoId,
  };
}
