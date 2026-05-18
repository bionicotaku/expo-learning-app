import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { VideoListItem } from '@/entities/video';
import type { VideoMeta } from '@/entities/video-meta';
import type { Transcript } from '@/entities/transcript';
import { ApiError } from '@/shared/api';
import { toast } from '@/shared/lib/toast';

import { getVideoMetaQueryKey } from './fullscreen-video-resource-query';
import { useFullscreenVideoResources } from './use-fullscreen-video-resources';

const { fetchTranscriptAssetMock, fetchVideoMetaMock } = vi.hoisted(() => ({
  fetchTranscriptAssetMock: vi.fn(),
  fetchVideoMetaMock: vi.fn(),
}));

vi.mock('@/entities/video-meta', () => ({
  fetchVideoMeta: fetchVideoMetaMock,
}));

vi.mock('@/entities/transcript', () => ({
  fetchTranscriptAsset: fetchTranscriptAssetMock,
}));

const items: VideoListItem[] = [
  {
    coverImageUrl: null,
    description: 'desc 1',
    durationSeconds: 10,
    favoriteCount: 1,
    likeCount: 10,
    recommendationRunId: '00000000-0000-4000-8000-000000000000',
    learningUnits: [],
    title: 'Video 1',
    videoId: 'video-1',
    videoUrl: 'https://example.com/1.m3u8',
    viewCount: 1,
  },
];

const videoMetaWithTranscript: VideoMeta = {
  isFavorited: false,
  isLiked: false,
  transcriptUrl: 'https://example.com/transcript.json',
  videoId: 'video-1',
};

const transcript: Transcript = {
  sentences: [
    {
      end: 1000,
      explanation: 'explanation',
      index: 0,
      start: 0,
      text: 'hello',
      tokens: [],
    },
  ],
};

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

async function flushQueryWork() {
  await act(async () => {
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

async function waitForAssertion(assertion: () => void) {
  let lastError: unknown;

  for (let attempt = 0; attempt < 10; attempt += 1) {
    await flushQueryWork();

    try {
      assertion();
      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

function TestResourceConsumer() {
  useFullscreenVideoResources({
    activeIndex: 0,
    activeVideoId: 'video-1',
    items,
  });

  return null;
}

describe('useFullscreenVideoResources runtime', () => {
  let queryClient: QueryClient;
  let renderer: TestRenderer.ReactTestRenderer | null;
  let toastSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.restoreAllMocks();
    queryClient = createQueryClient();
    renderer = null;
    fetchTranscriptAssetMock.mockReset();
    fetchVideoMetaMock.mockReset();
    toast.clear();
    toastSpy = vi.spyOn(toast, 'show');
  });

  afterEach(() => {
    act(() => {
      renderer?.unmount();
    });
    queryClient.clear();
  });

  function renderConsumer() {
    act(() => {
      renderer = TestRenderer.create(
        <QueryClientProvider client={queryClient}>
          <TestResourceConsumer />
        </QueryClientProvider>
      );
    });
  }

  function unmountConsumer() {
    act(() => {
      renderer?.unmount();
      renderer = null;
    });
  }

  function rerenderConsumer() {
    act(() => {
      renderer?.update(
        <QueryClientProvider client={queryClient}>
          <TestResourceConsumer />
        </QueryClientProvider>
      );
    });
  }

  it('shows a red Chinese toast when video meta loading fails', async () => {
    fetchVideoMetaMock.mockRejectedValue(new Error('meta failed'));

    renderConsumer();

    await waitForAssertion(() => {
      expect(toastSpy).toHaveBeenCalledWith({
        kind: 'error',
        title: '视频数据获取失败',
      });
    });
  });

  it('shows a red Chinese toast when transcript asset loading fails', async () => {
    fetchVideoMetaMock.mockResolvedValue(videoMetaWithTranscript);
    fetchTranscriptAssetMock.mockRejectedValue(new Error('transcript failed'));

    renderConsumer();

    await waitForAssertion(() => {
      expect(toastSpy).toHaveBeenCalledWith({
        kind: 'error',
        title: '字幕获取失败',
      });
    });
  });

  it('passes the React Query signal to transcript asset loading', async () => {
    fetchVideoMetaMock.mockResolvedValue(videoMetaWithTranscript);
    fetchTranscriptAssetMock.mockResolvedValue(transcript);

    renderConsumer();

    await waitForAssertion(() => {
      expect(fetchTranscriptAssetMock).toHaveBeenCalledWith(
        videoMetaWithTranscript.transcriptUrl,
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        })
      );
    });
  });

  it('does not show transcript failure toast for React Query abort errors', async () => {
    fetchVideoMetaMock.mockResolvedValue(videoMetaWithTranscript);
    fetchTranscriptAssetMock.mockRejectedValue(
      new ApiError('Request was aborted', {
        code: 'REQUEST_ABORTED',
        retryable: false,
      })
    );

    renderConsumer();

    await waitForAssertion(() => {
      expect(fetchTranscriptAssetMock).toHaveBeenCalledTimes(1);
    });
    await flushQueryWork();

    expect(toastSpy).not.toHaveBeenCalledWith({
      kind: 'error',
      title: '字幕获取失败',
    });
  });

  it('does not repeat the same failure toast on a stable error rerender', async () => {
    fetchVideoMetaMock.mockRejectedValue(new Error('meta failed'));

    renderConsumer();

    await waitForAssertion(() => {
      expect(toastSpy).toHaveBeenCalledTimes(1);
    });

    rerenderConsumer();

    await waitForAssertion(() => {
      expect(toastSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('shows a new toast when the same video meta query is fetched again and fails again', async () => {
    fetchVideoMetaMock.mockRejectedValue(new Error('meta failed'));

    renderConsumer();

    await waitForAssertion(() => {
      expect(toastSpy).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      await queryClient.refetchQueries({
        queryKey: getVideoMetaQueryKey('video-1'),
      });
    });

    await waitForAssertion(() => {
      expect(fetchVideoMetaMock).toHaveBeenCalledTimes(2);
      expect(toastSpy).toHaveBeenCalledTimes(2);
      expect(toastSpy).toHaveBeenLastCalledWith({
        kind: 'error',
        title: '视频数据获取失败',
      });
    });
  });

  it('refetches a failed video meta query when fullscreen resources mount again', async () => {
    fetchVideoMetaMock.mockRejectedValue(new Error('meta failed'));

    renderConsumer();

    await waitForAssertion(() => {
      expect(fetchVideoMetaMock).toHaveBeenCalledTimes(1);
      expect(toastSpy).toHaveBeenCalledTimes(1);
    });

    unmountConsumer();
    renderConsumer();

    await waitForAssertion(() => {
      expect(fetchVideoMetaMock).toHaveBeenCalledTimes(2);
      expect(toastSpy).toHaveBeenCalledTimes(2);
      expect(toastSpy).toHaveBeenLastCalledWith({
        kind: 'error',
        title: '视频数据获取失败',
      });
    });
  });

  it('refetches a failed transcript asset query when fullscreen resources mount again', async () => {
    fetchVideoMetaMock.mockResolvedValue(videoMetaWithTranscript);
    fetchTranscriptAssetMock.mockRejectedValue(new Error('transcript failed'));

    renderConsumer();

    await waitForAssertion(() => {
      expect(fetchVideoMetaMock).toHaveBeenCalledTimes(1);
      expect(fetchTranscriptAssetMock).toHaveBeenCalledTimes(1);
      expect(toastSpy).toHaveBeenCalledWith({
        kind: 'error',
        title: '字幕获取失败',
      });
    });

    unmountConsumer();
    renderConsumer();

    await waitForAssertion(() => {
      expect(fetchVideoMetaMock).toHaveBeenCalledTimes(1);
      expect(fetchTranscriptAssetMock).toHaveBeenCalledTimes(2);
      expect(toastSpy).toHaveBeenCalledTimes(2);
      expect(toastSpy).toHaveBeenLastCalledWith({
        kind: 'error',
        title: '字幕获取失败',
      });
    });
  });

  it('keeps successful video meta and transcript asset caches on remount without refetching', async () => {
    fetchVideoMetaMock.mockResolvedValue(videoMetaWithTranscript);
    fetchTranscriptAssetMock.mockResolvedValue(transcript);

    renderConsumer();

    await waitForAssertion(() => {
      expect(fetchVideoMetaMock).toHaveBeenCalledTimes(1);
      expect(fetchTranscriptAssetMock).toHaveBeenCalledTimes(1);
    });

    unmountConsumer();
    renderConsumer();
    await flushQueryWork();

    expect(fetchVideoMetaMock).toHaveBeenCalledTimes(1);
    expect(fetchTranscriptAssetMock).toHaveBeenCalledTimes(1);
  });
});
