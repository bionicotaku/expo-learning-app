import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useVideoRuntimeStore } from '@/features/video-runtime';
import { toast } from '@/shared/lib/toast';

import { useVideoEngagementState } from './use-video-engagement-state';

const { setVideoFavoritedMock, setVideoLikedMock } = vi.hoisted(() => ({
  setVideoFavoritedMock: vi.fn(),
  setVideoLikedMock: vi.fn(),
}));

vi.mock('../api/video-engagement-repository', () => ({
  setVideoFavorited: setVideoFavoritedMock,
  setVideoLiked: setVideoLikedMock,
}));

type UseVideoEngagementStateResult = ReturnType<typeof useVideoEngagementState>;

let latestResult: UseVideoEngagementStateResult | null = null;

function createDeferred() {
  let resolve!: () => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<void>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return {
    promise,
    resolve,
    reject,
  };
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false,
      },
      queries: {
        retry: false,
      },
    },
  });
}

function Harness({
  baseIsFavorited = false,
  baseIsLiked = false,
  isEnabled = true,
}: {
  baseIsFavorited?: boolean;
  baseIsLiked?: boolean;
  isEnabled?: boolean;
}) {
  latestResult = useVideoEngagementState({
    baseFavoriteCount: 20,
    baseIsFavorited,
    baseIsLiked,
    baseLikeCount: 100,
    isEnabled,
    videoId: 'the-office-health-care-video-1',
  });

  return null;
}

async function flushWork() {
  await act(async () => {
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

async function waitForAssertion(assertion: () => void) {
  let lastError: unknown;

  for (let attempt = 0; attempt < 10; attempt += 1) {
    await flushWork();

    try {
      assertion();
      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

describe('useVideoEngagementState runtime', () => {
  let queryClient: QueryClient;
  let renderer: TestRenderer.ReactTestRenderer | null;
  let toastSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    queryClient = createQueryClient();
    renderer = null;
    latestResult = null;
    setVideoFavoritedMock.mockReset();
    setVideoLikedMock.mockReset();
    setVideoFavoritedMock.mockResolvedValue(undefined);
    setVideoLikedMock.mockResolvedValue(undefined);
    useVideoRuntimeStore.getState().clearAll();
    toast.clear();
    toastSpy = vi.spyOn(toast, 'show');
  });

  afterEach(() => {
    act(() => {
      renderer?.unmount();
    });
    queryClient.clear();
    vi.restoreAllMocks();
    useVideoRuntimeStore.getState().clearAll();
    toast.clear();
  });

  function renderHarness(props?: React.ComponentProps<typeof Harness>) {
    act(() => {
      renderer = TestRenderer.create(
        <QueryClientProvider client={queryClient}>
          <Harness {...props} />
        </QueryClientProvider>
      );
    });
  }

  it('optimistically likes a video, increments count, and keeps the runtime override after success', async () => {
    const likeRequest = createDeferred();
    setVideoLikedMock.mockReturnValueOnce(likeRequest.promise);
    renderHarness();

    act(() => {
      void latestResult?.setLiked(true);
    });

    await waitForAssertion(() => {
      expect(latestResult?.isLiked).toBe(true);
      expect(latestResult?.likeCount).toBe(101);
      expect(latestResult?.isLikePending).toBe(true);
    });

    expect(setVideoLikedMock).toHaveBeenCalledWith('the-office-health-care-video-1', true);

    await act(async () => {
      likeRequest.resolve();
      await likeRequest.promise;
    });

    await waitForAssertion(() => {
      expect(latestResult?.isLikePending).toBe(false);
      expect(useVideoRuntimeStore.getState().overridesByVideoId).toEqual({
        'the-office-health-care-video-1': {
          isLiked: true,
        },
      });
    });
  });

  it('rolls back a failed like write and shows a Chinese toast', async () => {
    setVideoLikedMock.mockRejectedValueOnce(new Error('like failed'));
    renderHarness();

    await act(async () => {
      await latestResult?.setLiked(true);
    });

    await waitForAssertion(() => {
      expect(latestResult?.isLiked).toBe(false);
      expect(latestResult?.likeCount).toBe(100);
      expect(toastSpy).toHaveBeenCalledWith({
        kind: 'error',
        title: '点赞失败',
      });
    });
  });

  it('rolls back failed unlike and unfavorite writes with action-specific toasts', async () => {
    setVideoLikedMock.mockRejectedValueOnce(new Error('unlike failed'));
    setVideoFavoritedMock.mockRejectedValueOnce(new Error('unfavorite failed'));
    renderHarness({
      baseIsFavorited: true,
      baseIsLiked: true,
    });

    await act(async () => {
      await latestResult?.setLiked(false);
      await latestResult?.setFavorited(false);
    });

    await waitForAssertion(() => {
      expect(latestResult?.isLiked).toBe(true);
      expect(latestResult?.isFavorited).toBe(true);
      expect(toastSpy).toHaveBeenCalledWith({
        kind: 'error',
        title: '取消点赞失败',
      });
      expect(toastSpy).toHaveBeenCalledWith({
        kind: 'error',
        title: '取消收藏失败',
      });
    });
  });

  it('blocks duplicate pending writes for the same field while allowing the other field', async () => {
    const likeRequest = createDeferred();
    setVideoLikedMock.mockReturnValueOnce(likeRequest.promise);
    renderHarness();

    act(() => {
      void latestResult?.setLiked(true);
      void latestResult?.setLiked(false);
      void latestResult?.setFavorited(true);
    });

    await waitForAssertion(() => {
      expect(setVideoLikedMock).toHaveBeenCalledTimes(1);
      expect(setVideoFavoritedMock).toHaveBeenCalledTimes(1);
      expect(latestResult?.isLiked).toBe(true);
      expect(latestResult?.isFavorited).toBe(true);
      expect(latestResult?.isLikePending).toBe(true);
      expect(latestResult?.isFavoritePending).toBe(false);
    });

    await act(async () => {
      likeRequest.resolve();
      await likeRequest.promise;
    });
  });

  it('does not write runtime state or call the API while disabled', async () => {
    renderHarness({
      isEnabled: false,
    });

    await act(async () => {
      await latestResult?.setLiked(true);
      await latestResult?.setFavorited(true);
    });

    expect(setVideoLikedMock).not.toHaveBeenCalled();
    expect(setVideoFavoritedMock).not.toHaveBeenCalled();
    expect(useVideoRuntimeStore.getState().overridesByVideoId).toEqual({});
  });
});
