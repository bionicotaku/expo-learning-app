import { describe, expect, it, beforeEach, vi } from 'vitest';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import type { VideoListItem } from '@/entities/video';

import { VideoDetailPage } from './video-detail-page';

const {
  setPendingRestoreVideoIdMock,
  requestMoreMock,
} = vi.hoisted(() => ({
  setPendingRestoreVideoIdMock: vi.fn(),
  requestMoreMock: vi.fn(),
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

const hoistedState = vi.hoisted(() => ({
  latestFullscreenVideoSessionProps: null as React.ComponentProps<any> | null,
  mockFeedSourceState: null as
    | {
        isInitialLoading: boolean;
        items: VideoListItem[];
        requestMore: () => Promise<void>;
      }
    | null,
  mockVideoId: 'video-a' as string | string[] | undefined,
}));

vi.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ videoId: hoistedState.mockVideoId }),
}));

vi.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

vi.mock('@/features/feed-session', () => ({
  setPendingRestoreVideoId: setPendingRestoreVideoIdMock,
}));

vi.mock('@/features/feed-source', () => ({
  useFeedSource: () => hoistedState.mockFeedSourceState,
}));

vi.mock('./fullscreen-video-session', async () => {
  const ReactModule = await import('react');

  function FullscreenVideoSession(
    props: React.ComponentProps<any>
  ) {
    hoistedState.latestFullscreenVideoSessionProps = props;
    return ReactModule.createElement('FullscreenVideoSession', props);
  }

  return { FullscreenVideoSession };
});

describe('video detail page runtime', () => {
  beforeEach(() => {
    hoistedState.mockVideoId = 'video-a';
    hoistedState.mockFeedSourceState = {
      isInitialLoading: false,
      items,
      requestMore: requestMoreMock,
    };
    hoistedState.latestFullscreenVideoSessionProps = null;
    requestMoreMock.mockReset();
    setPendingRestoreVideoIdMock.mockReset();
  });

  it('writes the new route entry target on unmount even if the new session never reports an active video', () => {
    let renderer: TestRenderer.ReactTestRenderer;

    act(() => {
      renderer = TestRenderer.create(<VideoDetailPage />);
    });

    hoistedState.mockVideoId = 'video-b';

    act(() => {
      renderer!.update(<VideoDetailPage />);
    });

    act(() => {
      renderer!.unmount();
    });

    expect(setPendingRestoreVideoIdMock).toHaveBeenLastCalledWith('video-b');
  });

  it('backfills the restore target once items arrive for an already-created session', () => {
    let renderer: TestRenderer.ReactTestRenderer;

    hoistedState.mockVideoId = 'video-b';
    hoistedState.mockFeedSourceState = {
      isInitialLoading: true,
      items: [],
      requestMore: requestMoreMock,
    };

    act(() => {
      renderer = TestRenderer.create(<VideoDetailPage />);
    });

    hoistedState.mockFeedSourceState = {
      isInitialLoading: false,
      items,
      requestMore: requestMoreMock,
    };

    act(() => {
      renderer!.update(<VideoDetailPage />);
    });

    act(() => {
      renderer!.unmount();
    });

    expect(setPendingRestoreVideoIdMock).toHaveBeenLastCalledWith('video-b');
  });

  it('prefers the later committed active video over the seeded route entry target', () => {
    let renderer: TestRenderer.ReactTestRenderer;

    act(() => {
      renderer = TestRenderer.create(<VideoDetailPage />);
    });

    expect(hoistedState.latestFullscreenVideoSessionProps).not.toBeNull();

    act(() => {
      hoistedState.latestFullscreenVideoSessionProps!.onLatestActiveVideoIdChange(
        'video-c'
      );
    });

    act(() => {
      renderer!.unmount();
    });

    expect(setPendingRestoreVideoIdMock).toHaveBeenLastCalledWith('video-c');
  });
});
