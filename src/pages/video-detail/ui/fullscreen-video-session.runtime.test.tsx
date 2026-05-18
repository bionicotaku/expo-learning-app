import { describe, expect, it, beforeEach, vi } from 'vitest';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import type { VideoListItem } from '@/entities/video';
import type { VideoMeta } from '@/entities/video-meta';
import type { Transcript } from '@/entities/transcript';

import { FullscreenVideoSession } from './fullscreen-video-session';

const {
  flushWatchProgressMock,
  onLatestActiveVideoIdChangeMock,
  prefetchEndQuizForVideoMock,
  presentEndQuizBeforeAdvanceMock,
  presentPlaybackSettingsSheetMock,
  reportWatchProgressSampleMock,
  requestMoreMock,
  useSubtitleDisplayModeMock,
  useVideoDetailsVisibleMock,
  useFullscreenVideoResourcesMock,
} = vi.hoisted(() => ({
  flushWatchProgressMock: vi.fn(),
  onLatestActiveVideoIdChangeMock: vi.fn(),
  prefetchEndQuizForVideoMock: vi.fn(),
  presentEndQuizBeforeAdvanceMock: vi.fn(),
  presentPlaybackSettingsSheetMock: vi.fn(),
  reportWatchProgressSampleMock: vi.fn(),
  requestMoreMock: vi.fn(),
  useSubtitleDisplayModeMock: vi.fn(),
  useVideoDetailsVisibleMock: vi.fn(),
  useFullscreenVideoResourcesMock: vi.fn(),
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
    videoId: 'video-a',
    videoUrl: 'https://example.com/a.m3u8',
    viewCount: 1,
  },
  {
    coverImageUrl: null,
    description: 'desc 2',
    durationSeconds: 20,
    favoriteCount: 2,
    likeCount: 20,
    recommendationRunId: '00000000-0000-4000-8000-000000000000',
    learningUnits: [],
    title: 'Video 2',
    videoId: 'video-b',
    videoUrl: 'https://example.com/b.m3u8',
    viewCount: 2,
  },
  {
    coverImageUrl: null,
    description: 'desc 3',
    durationSeconds: 30,
    favoriteCount: 3,
    likeCount: 30,
    recommendationRunId: '00000000-0000-4000-8000-000000000000',
    learningUnits: [],
    title: 'Video 3',
    videoId: 'video-c',
    videoUrl: 'https://example.com/c.m3u8',
    viewCount: 3,
  },
];

const activeTranscript: Transcript = {
  sentences: [
    {
      end: 2000,
      explanation: 'sentence explanation',
      index: 0,
      start: 1000,
      text: 'Active transcript sentence',
      tokens: [],
    },
  ],
};

const activeVideoMeta: VideoMeta = {
  videoId: 'video-a',
  isLiked: true,
  isFavorited: false,
  transcriptUrl: 'https://example.com/transcript-a.json',
};

const videoMetaByVideoId = new Map<string, VideoMeta>([
  [activeVideoMeta.videoId, activeVideoMeta],
]);

function createHandledRejectedRequest() {
  const request = Promise.reject(new Error('load more failed'));
  request.catch(() => undefined);
  return request;
}

const hoistedState = vi.hoisted(() => ({
  isScreenFocused: true,
  latestFocusCleanup: null as null | (() => void),
  latestFullscreenVideoPagerProps: null as React.ComponentProps<any> | null,
}));

vi.mock('expo-router', () => ({
  useFocusEffect: (callback: () => void | (() => void)) => {
    if (!hoistedState.isScreenFocused) {
      hoistedState.latestFocusCleanup = null;
      return;
    }

    hoistedState.latestFocusCleanup = callback() ?? null;
  },
  useIsFocused: () => hoistedState.isScreenFocused,
}));

vi.mock('@/features/fullscreen-video-resources', () => ({
  useFullscreenVideoResources: useFullscreenVideoResourcesMock,
}));

vi.mock('@/features/playback-settings', () => ({
  usePresentPlaybackSettingsSheet: () => presentPlaybackSettingsSheetMock,
  useSubtitleDisplayMode: useSubtitleDisplayModeMock,
  useVideoDetailsVisible: useVideoDetailsVisibleMock,
}));

vi.mock('@/features/video-watch-progress', () => ({
  useVideoWatchProgressReporter: () => ({
    flush: flushWatchProgressMock,
    reportSample: reportWatchProgressSampleMock,
  }),
}));

vi.mock('@/features/video-end-quiz', () => ({
  useVideoEndQuiz: () => ({
    prefetchEndQuizForVideo: prefetchEndQuizForVideoMock,
    presentEndQuizBeforeAdvance: presentEndQuizBeforeAdvanceMock,
  }),
}));

vi.mock('@/widgets/fullscreen-video-pager', async () => {
  const ReactModule = await import('react');

  function FullscreenVideoPager(
    props: React.ComponentProps<any>
  ) {
    hoistedState.latestFullscreenVideoPagerProps = props;
    return ReactModule.createElement('FullscreenVideoPager', props);
  }

  return { FullscreenVideoPager };
});

describe('fullscreen video session runtime', () => {
  beforeEach(() => {
    flushWatchProgressMock.mockReset();
    flushWatchProgressMock.mockResolvedValue(undefined);
    hoistedState.isScreenFocused = true;
    hoistedState.latestFocusCleanup = null;
    hoistedState.latestFullscreenVideoPagerProps = null;
    onLatestActiveVideoIdChangeMock.mockReset();
    prefetchEndQuizForVideoMock.mockReset();
    prefetchEndQuizForVideoMock.mockResolvedValue(undefined);
    presentEndQuizBeforeAdvanceMock.mockReset();
    presentEndQuizBeforeAdvanceMock.mockResolvedValue(undefined);
    presentPlaybackSettingsSheetMock.mockReset();
    reportWatchProgressSampleMock.mockReset();
    requestMoreMock.mockReset();
    requestMoreMock.mockResolvedValue(undefined);
    useSubtitleDisplayModeMock.mockReset();
    useSubtitleDisplayModeMock.mockReturnValue('english');
    useVideoDetailsVisibleMock.mockReset();
    useVideoDetailsVisibleMock.mockReturnValue(true);
    useFullscreenVideoResourcesMock.mockReset();
    useFullscreenVideoResourcesMock.mockReturnValue({
      activeVideoMeta: null,
      activeVideoMetaStatus: 'idle',
      activeTranscript: null,
      activeTranscriptError: null,
      activeTranscriptStatus: 'idle',
      videoMetaByVideoId: new Map(),
    });
  });

  it('uses the entry target as the initial fullscreen resource input before the pager reports an active item', () => {
    act(() => {
      TestRenderer.create(
        <FullscreenVideoSession
          entryIndex={1}
          entryVideoId="video-b"
          isInitialLoading={false}
          items={items}
          onLatestActiveVideoIdChange={onLatestActiveVideoIdChangeMock}
          requestMore={requestMoreMock}
        />
      );
    });

    expect(useFullscreenVideoResourcesMock).toHaveBeenLastCalledWith({
      activeIndex: 1,
      activeVideoId: 'video-b',
      items,
    });
    expect(hoistedState.latestFullscreenVideoPagerProps).toMatchObject({
      entryIndex: 1,
      isScreenFocused: true,
      isInitialLoading: false,
      items,
    });
  });

  it('prefetches end quiz for the entry video when the session mounts', () => {
    act(() => {
      TestRenderer.create(
        <FullscreenVideoSession
          entryIndex={1}
          entryVideoId="video-b"
          isInitialLoading={false}
          items={items}
          onLatestActiveVideoIdChange={onLatestActiveVideoIdChangeMock}
          requestMore={requestMoreMock}
        />
      );
    });

    expect(prefetchEndQuizForVideoMock).toHaveBeenCalledWith(items[1], {
      shouldToastFailure: expect.any(Function),
    });

    const options = prefetchEndQuizForVideoMock.mock.calls.at(-1)?.[1];
    expect(options.shouldToastFailure()).toBe(true);
  });

  it('passes the current screen focus state through to the pager', () => {
    hoistedState.isScreenFocused = false;

    act(() => {
      TestRenderer.create(
        <FullscreenVideoSession
          entryIndex={1}
          entryVideoId="video-b"
          isInitialLoading={false}
          items={items}
          onLatestActiveVideoIdChange={onLatestActiveVideoIdChangeMock}
          requestMore={requestMoreMock}
        />
      );
    });

    expect(hoistedState.latestFullscreenVideoPagerProps).toMatchObject({
      isScreenFocused: false,
    });
  });

  it('switches fullscreen resource input to the pager-reported active video once the pager emits', () => {
    act(() => {
      TestRenderer.create(
        <FullscreenVideoSession
          entryIndex={0}
          entryVideoId="video-a"
          isInitialLoading={false}
          items={items}
          onLatestActiveVideoIdChange={onLatestActiveVideoIdChangeMock}
          requestMore={requestMoreMock}
        />
      );
    });

    act(() => {
      hoistedState.latestFullscreenVideoPagerProps!.onActiveVideoChange(
        'video-c',
        2
      );
    });

    expect(useFullscreenVideoResourcesMock).toHaveBeenLastCalledWith({
      activeIndex: 2,
      activeVideoId: 'video-c',
      items,
    });
    expect(onLatestActiveVideoIdChangeMock).toHaveBeenLastCalledWith('video-c');
  });

  it('prefetches end quiz for the newly active video and suppresses stale active failures', () => {
    act(() => {
      TestRenderer.create(
        <FullscreenVideoSession
          entryIndex={0}
          entryVideoId="video-a"
          isInitialLoading={false}
          items={items}
          onLatestActiveVideoIdChange={onLatestActiveVideoIdChangeMock}
          requestMore={requestMoreMock}
        />
      );
    });

    expect(hoistedState.latestFullscreenVideoPagerProps).toMatchObject({
      onBeforeAdvanceFromVideoEnd: presentEndQuizBeforeAdvanceMock,
    });

    act(() => {
      hoistedState.latestFullscreenVideoPagerProps!.onActiveVideoChange(
        'video-b',
        1
      );
    });

    const videoBOptions = prefetchEndQuizForVideoMock.mock.calls.at(-1)?.[1];
    expect(prefetchEndQuizForVideoMock).toHaveBeenLastCalledWith(items[1], {
      shouldToastFailure: expect.any(Function),
    });
    expect(videoBOptions.shouldToastFailure()).toBe(true);

    act(() => {
      hoistedState.latestFullscreenVideoPagerProps!.onActiveVideoChange(
        'video-c',
        2
      );
    });

    const videoCOptions = prefetchEndQuizForVideoMock.mock.calls.at(-1)?.[1];
    expect(prefetchEndQuizForVideoMock).toHaveBeenLastCalledWith(items[2], {
      shouldToastFailure: expect.any(Function),
    });
    expect(videoBOptions.shouldToastFailure()).toBe(false);
    expect(videoCOptions.shouldToastFailure()).toBe(true);
  });

  it('passes the end quiz presenter to the pager', () => {
    act(() => {
      TestRenderer.create(
        <FullscreenVideoSession
          entryIndex={0}
          entryVideoId="video-a"
          isInitialLoading={false}
          items={items}
          onLatestActiveVideoIdChange={onLatestActiveVideoIdChangeMock}
          requestMore={requestMoreMock}
        />
      );
    });

    expect(hoistedState.latestFullscreenVideoPagerProps).toMatchObject({
      onBeforeAdvanceFromVideoEnd: presentEndQuizBeforeAdvanceMock,
    });
  });

  it('flushes pending watch progress before applying an active video change', () => {
    act(() => {
      TestRenderer.create(
        <FullscreenVideoSession
          entryIndex={0}
          entryVideoId="video-a"
          isInitialLoading={false}
          items={items}
          onLatestActiveVideoIdChange={onLatestActiveVideoIdChangeMock}
          requestMore={requestMoreMock}
        />
      );
    });

    act(() => {
      hoistedState.latestFullscreenVideoPagerProps!.onActiveVideoChange(
        'video-c',
        2
      );
    });

    expect(flushWatchProgressMock).toHaveBeenCalledTimes(1);
    expect(flushWatchProgressMock.mock.invocationCallOrder[0]).toBeLessThan(
      onLatestActiveVideoIdChangeMock.mock.invocationCallOrder[0]
    );
  });

  it('flushes pending watch progress when the video screen loses focus', () => {
    act(() => {
      TestRenderer.create(
        <FullscreenVideoSession
          entryIndex={0}
          entryVideoId="video-a"
          isInitialLoading={false}
          items={items}
          onLatestActiveVideoIdChange={onLatestActiveVideoIdChangeMock}
          requestMore={requestMoreMock}
        />
      );
    });

    act(() => {
      hoistedState.latestFocusCleanup?.();
    });

    expect(flushWatchProgressMock).toHaveBeenCalledTimes(1);
  });

  it('flushes pending watch progress every ten seconds while the video screen is focused', () => {
    vi.useFakeTimers();

    try {
      act(() => {
        TestRenderer.create(
          <FullscreenVideoSession
            entryIndex={0}
            entryVideoId="video-a"
            isInitialLoading={false}
            items={items}
            onLatestActiveVideoIdChange={onLatestActiveVideoIdChangeMock}
            requestMore={requestMoreMock}
          />
        );
      });

      expect(flushWatchProgressMock).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(10_000);
      });

      expect(flushWatchProgressMock).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('stops the watch progress timer after the video screen loses focus', () => {
    vi.useFakeTimers();

    try {
      act(() => {
        TestRenderer.create(
          <FullscreenVideoSession
            entryIndex={0}
            entryVideoId="video-a"
            isInitialLoading={false}
            items={items}
            onLatestActiveVideoIdChange={onLatestActiveVideoIdChangeMock}
            requestMore={requestMoreMock}
          />
        );
      });

      act(() => {
        vi.advanceTimersByTime(10_000);
      });
      expect(flushWatchProgressMock).toHaveBeenCalledTimes(1);

      act(() => {
        hoistedState.latestFocusCleanup?.();
      });
      expect(flushWatchProgressMock).toHaveBeenCalledTimes(2);

      act(() => {
        vi.advanceTimersByTime(10_000);
      });
      expect(flushWatchProgressMock).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('reports pager watch progress samples through the session-owned reporter', () => {
    act(() => {
      TestRenderer.create(
        <FullscreenVideoSession
          entryIndex={0}
          entryVideoId="video-a"
          isInitialLoading={false}
          items={items}
          onLatestActiveVideoIdChange={onLatestActiveVideoIdChangeMock}
          requestMore={requestMoreMock}
        />
      );
    });

    act(() => {
      hoistedState.latestFullscreenVideoPagerProps!.onWatchProgressSample({
        playbackRate: 1.25,
        snapshot: {
          currentTimeSeconds: 12.5,
          durationSeconds: 20,
        },
        videoId: 'video-a',
        watchSessionId: 'watch-session-1',
      });
    });

    expect(reportWatchProgressSampleMock).toHaveBeenCalledWith({
      currentTimeSeconds: 12.5,
      durationSeconds: 20,
      playbackRate: 1.25,
      videoId: 'video-a',
      watchSessionId: 'watch-session-1',
    });
  });

  it('passes the playback settings sheet presenter to center hold gestures', () => {
    act(() => {
      TestRenderer.create(
        <FullscreenVideoSession
          entryIndex={0}
          entryVideoId="video-a"
          isInitialLoading={false}
          items={items}
          onLatestActiveVideoIdChange={onLatestActiveVideoIdChangeMock}
          requestMore={requestMoreMock}
        />
      );
    });

    act(() => {
      hoistedState.latestFullscreenVideoPagerProps!.onCenterHoldStart();
    });

    expect(presentPlaybackSettingsSheetMock).toHaveBeenCalledTimes(1);
  });

  it('passes loaded active transcript through to the pager without subtitle layout reserve state', () => {
    useFullscreenVideoResourcesMock.mockReturnValue({
      activeVideoMeta,
      activeVideoMetaStatus: 'success',
      activeTranscript,
      activeTranscriptError: null,
      activeTranscriptStatus: 'success',
      videoMetaByVideoId,
    });

    act(() => {
      TestRenderer.create(
        <FullscreenVideoSession
          entryIndex={0}
          entryVideoId="video-a"
          isInitialLoading={false}
          items={items}
          onLatestActiveVideoIdChange={onLatestActiveVideoIdChangeMock}
          requestMore={requestMoreMock}
        />
      );
    });

    expect(hoistedState.latestFullscreenVideoPagerProps).toMatchObject({
      activeTranscript,
      subtitleDisplayMode: 'english',
      videoDetailsVisible: true,
      videoMetaByVideoId,
    });
    expect(hoistedState.latestFullscreenVideoPagerProps).not.toHaveProperty(
      'shouldReserveSubtitleSpace'
    );
  });

  it('passes the global subtitle display mode preference through to the pager', () => {
    useSubtitleDisplayModeMock.mockReturnValue('bilingual');

    act(() => {
      TestRenderer.create(
        <FullscreenVideoSession
          entryIndex={0}
          entryVideoId="video-a"
          isInitialLoading={false}
          items={items}
          onLatestActiveVideoIdChange={onLatestActiveVideoIdChangeMock}
          requestMore={requestMoreMock}
        />
      );
    });

    expect(hoistedState.latestFullscreenVideoPagerProps).toMatchObject({
      subtitleDisplayMode: 'bilingual',
    });
  });

  it('passes the global video details visibility preference through to the pager', () => {
    useVideoDetailsVisibleMock.mockReturnValue(false);

    act(() => {
      TestRenderer.create(
        <FullscreenVideoSession
          entryIndex={0}
          entryVideoId="video-a"
          isInitialLoading={false}
          items={items}
          onLatestActiveVideoIdChange={onLatestActiveVideoIdChangeMock}
          requestMore={requestMoreMock}
        />
      );
    });

    expect(hoistedState.latestFullscreenVideoPagerProps).toMatchObject({
      videoDetailsVisible: false,
    });
  });

  it('allows near-tail requestMore to run again for the same tail after a failure', async () => {
    requestMoreMock.mockImplementation(createHandledRejectedRequest);

    act(() => {
      TestRenderer.create(
        <FullscreenVideoSession
          entryIndex={0}
          entryVideoId="video-a"
          isInitialLoading={false}
          items={items}
          onLatestActiveVideoIdChange={onLatestActiveVideoIdChangeMock}
          requestMore={requestMoreMock}
        />
      );
    });

    act(() => {
      hoistedState.latestFullscreenVideoPagerProps!.onActiveVideoChange(
        'video-b',
        1
      );
    });
    await act(async () => {
      await Promise.resolve();
    });
    act(() => {
      hoistedState.latestFullscreenVideoPagerProps!.onActiveVideoChange(
        'video-c',
        2
      );
    });

    expect(requestMoreMock).toHaveBeenCalledTimes(2);
  });

  it('does not repeat a successful near-tail request for the same tail', async () => {
    requestMoreMock.mockResolvedValue(undefined);

    act(() => {
      TestRenderer.create(
        <FullscreenVideoSession
          entryIndex={0}
          entryVideoId="video-a"
          isInitialLoading={false}
          items={items}
          onLatestActiveVideoIdChange={onLatestActiveVideoIdChangeMock}
          requestMore={requestMoreMock}
        />
      );
    });

    act(() => {
      hoistedState.latestFullscreenVideoPagerProps!.onActiveVideoChange(
        'video-b',
        1
      );
    });
    await act(async () => {
      await Promise.resolve();
    });
    act(() => {
      hoistedState.latestFullscreenVideoPagerProps!.onActiveVideoChange(
        'video-c',
        2
      );
    });

    expect(requestMoreMock).toHaveBeenCalledTimes(1);
  });
});
