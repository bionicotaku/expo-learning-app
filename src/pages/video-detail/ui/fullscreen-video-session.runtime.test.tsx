import { describe, expect, it, beforeEach, vi } from 'vitest';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import type { VideoListItem } from '@/entities/video';
import type { VideoMeta } from '@/entities/video-meta';
import type { Transcript } from '@/entities/transcript';

import { FullscreenVideoSession } from './fullscreen-video-session';

const {
  onLatestActiveVideoIdChangeMock,
  presentPlaybackSettingsSheetMock,
  requestMoreMock,
  useSubtitleDisplayModeMock,
  useVideoDetailsVisibleMock,
  useFullscreenVideoResourcesMock,
} = vi.hoisted(() => ({
  onLatestActiveVideoIdChangeMock: vi.fn(),
  presentPlaybackSettingsSheetMock: vi.fn(),
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
    tags: [],
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
    tags: [],
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
    tags: [],
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
  latestFullscreenVideoPagerProps: null as React.ComponentProps<any> | null,
}));

vi.mock('@/features/fullscreen-video-resources', () => ({
  useFullscreenVideoResources: useFullscreenVideoResourcesMock,
}));

vi.mock('@/features/playback-settings', () => ({
  usePresentPlaybackSettingsSheet: () => presentPlaybackSettingsSheetMock,
  useSubtitleDisplayMode: useSubtitleDisplayModeMock,
  useVideoDetailsVisible: useVideoDetailsVisibleMock,
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
    hoistedState.latestFullscreenVideoPagerProps = null;
    onLatestActiveVideoIdChangeMock.mockReset();
    presentPlaybackSettingsSheetMock.mockReset();
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
      isInitialLoading: false,
      items,
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
