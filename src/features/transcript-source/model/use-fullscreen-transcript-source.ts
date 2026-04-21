import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchTranscript, type Transcript } from '@/entities/transcript';
import type { VideoListItem } from '@/entities/video';

import { resolveTranscriptPrefetchVideoIds } from './transcript-prefetch';
import { getTranscriptQueryKey } from './transcript-query';

type UseFullscreenTranscriptSourceArgs = {
  activeVideoId: string | null;
  activeIndex: number | null;
  items: VideoListItem[];
};

type FullscreenTranscriptStatus = 'idle' | 'loading' | 'success' | 'error';

type FullscreenTranscriptSourceResult = {
  activeTranscript: Transcript | null;
  activeTranscriptStatus: FullscreenTranscriptStatus;
  activeTranscriptError: Error | null;
};

const inactiveTranscriptQueryKey = ['transcript', '__inactive__'] as const;

function createTranscriptQueryOptions(videoId: string) {
  return {
    queryKey: getTranscriptQueryKey(videoId),
    queryFn: () => fetchTranscript(videoId),
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
  };
}

export function useFullscreenTranscriptSource({
  activeVideoId,
  activeIndex,
  items,
}: UseFullscreenTranscriptSourceArgs): FullscreenTranscriptSourceResult {
  const queryClient = useQueryClient();
  const activeTranscriptQuery = useQuery(
    activeVideoId === null
      ? {
          queryKey: inactiveTranscriptQueryKey,
          queryFn: async (): Promise<Transcript> => {
            throw new Error('Inactive transcript query should never execute.');
          },
          enabled: activeVideoId !== null,
        }
      : {
          ...createTranscriptQueryOptions(activeVideoId),
          enabled: activeVideoId !== null,
        }
  );

  useEffect(() => {
    const prefetchVideoIds = resolveTranscriptPrefetchVideoIds({
      activeIndex,
      items,
    });

    for (const videoId of prefetchVideoIds) {
      void queryClient
        .prefetchQuery(createTranscriptQueryOptions(videoId))
        .catch(() => undefined);
    }
  }, [activeIndex, items, queryClient]);

  if (activeVideoId === null) {
    return {
      activeTranscript: null,
      activeTranscriptError: null,
      activeTranscriptStatus: 'idle',
    };
  }

  if (activeTranscriptQuery.isError) {
    return {
      activeTranscript: null,
      activeTranscriptError: activeTranscriptQuery.error as Error,
      activeTranscriptStatus: 'error',
    };
  }

  if (activeTranscriptQuery.data) {
    return {
      activeTranscript: activeTranscriptQuery.data,
      activeTranscriptError: null,
      activeTranscriptStatus: 'success',
    };
  }

  return {
    activeTranscript: null,
    activeTranscriptError: null,
    activeTranscriptStatus: 'loading',
  };
}
