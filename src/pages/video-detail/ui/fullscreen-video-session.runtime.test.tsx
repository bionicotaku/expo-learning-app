import { describe, expect, it, beforeEach, vi } from 'vitest';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import type { VideoListItem } from '@/entities/video';
import type { Transcript } from '@/entities/transcript';

import { FullscreenVideoSession } from './fullscreen-video-session';

const {
  onLatestActiveVideoIdChangeMock,
  presentPlaybackSettingsSheetMock,
  requestMoreMock,
  useSubtitleDisplayModeMock,
  useFullscreenTranscriptSourceMock,
} = vi.hoisted(() => ({
  onLatestActiveVideoIdChangeMock: vi.fn(),
  presentPlaybackSettingsSheetMock: vi.fn(),
  requestMoreMock: vi.fn(),
  useSubtitleDisplayModeMock: vi.fn(),
  useFullscreenTranscriptSourceMock: vi.fn(),
}));

const items: VideoListItem[] = [
  {
    coverImageUrl: null,
    description: 'desc 1',
    durationSeconds: 10,
    isFavorited: false,
    isLiked: false,
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
    isFavorited: false,
    isLiked: false,
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
    isFavorited: false,
    isLiked: false,
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

const hoistedState = vi.hoisted(() => ({
  latestFullscreenVideoPagerProps: null as React.ComponentProps<any> | null,
}));

vi.mock('@/features/transcript-source', () => ({
  useFullscreenTranscriptSource: useFullscreenTranscriptSourceMock,
}));

vi.mock('@/features/playback-settings', () => ({
  usePresentPlaybackSettingsSheet: () => presentPlaybackSettingsSheetMock,
  useSubtitleDisplayMode: useSubtitleDisplayModeMock,
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
    useSubtitleDisplayModeMock.mockReset();
    useSubtitleDisplayModeMock.mockReturnValue('english');
    useFullscreenTranscriptSourceMock.mockReset();
    useFullscreenTranscriptSourceMock.mockReturnValue({
      activeTranscript: null,
      activeTranscriptError: null,
      activeTranscriptStatus: 'idle',
    });
  });

  it('uses the entry target as the initial transcript source input before the pager reports an active item', () => {
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

    expect(useFullscreenTranscriptSourceMock).toHaveBeenLastCalledWith({
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

  it('switches transcript input to the pager-reported active video once the pager emits', () => {
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

    expect(useFullscreenTranscriptSourceMock).toHaveBeenLastCalledWith({
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
    useFullscreenTranscriptSourceMock.mockReturnValue({
      activeTranscript,
      activeTranscriptError: null,
      activeTranscriptStatus: 'success',
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
});
