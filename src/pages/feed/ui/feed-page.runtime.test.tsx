import { beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import type { VideoListItem } from '@/entities/video';

import { FeedPage } from './feed-page';

const {
  clearPendingRestoreVideoIdMock,
  getPendingRestoreVideoIdMock,
  navigateMock,
  requestMoreMock,
  refreshMock,
} = vi.hoisted(() => ({
  clearPendingRestoreVideoIdMock: vi.fn(),
  getPendingRestoreVideoIdMock: vi.fn(),
  navigateMock: vi.fn(),
  requestMoreMock: vi.fn(),
  refreshMock: vi.fn(),
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
];

vi.mock('expo-router', () => ({
  useFocusEffect: (callback: () => void | (() => void)) => {
    callback();
  },
  useRouter: () => ({
    navigate: navigateMock,
  }),
}));

vi.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

vi.mock('react-native', async () => {
  const ReactModule = await import('react');

  function createHostComponent(displayName: string) {
    const Component = ReactModule.forwardRef<any, any>(
      ({ children, ...props }, ref) =>
        ReactModule.createElement(displayName, { ...props, ref }, children)
    );

    Component.displayName = displayName;

    return Component;
  }

  return {
    ActivityIndicator: createHostComponent('ActivityIndicator'),
    FlatList: createHostComponent('FlatList'),
    Pressable: createHostComponent('Pressable'),
    RefreshControl: createHostComponent('RefreshControl'),
    Text: createHostComponent('Text'),
    View: createHostComponent('View'),
  };
});

vi.mock('@/features/feed-session', () => ({
  clearPendingRestoreVideoId: clearPendingRestoreVideoIdMock,
  getPendingRestoreVideoId: getPendingRestoreVideoIdMock,
}));

vi.mock('@/features/feed-source', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/feed-source')>();

  return {
    ...actual,
    useFeedSource: () => ({
      error: null,
      isExtending: false,
      isInitialLoading: false,
      items,
      refresh: refreshMock,
      requestMore: requestMoreMock,
    }),
  };
});

vi.mock('@/shared/theme/editorial-paper', () => ({
  useEditorialPaperTheme: () => ({
    tokens: {
      color: {
        accent: '#000000',
        background: '#ffffff',
      },
      spacing: {
        lg: 16,
        md: 12,
        pageTop: 24,
        pageX: 16,
        xxl: 32,
      },
    },
  }),
}));

vi.mock('@/shared/ui/editorial-paper', async () => {
  const ReactModule = await import('react');

  function HostText({ children, ...props }: React.ComponentProps<any>) {
    return ReactModule.createElement('Text', props, children);
  }

  return {
    EditorialTitle: HostText,
    MetaLabel: HostText,
  };
});

vi.mock('@/widgets/media-feature-card', async () => {
  const ReactModule = await import('react');

  return {
    MediaFeatureCard: (props: React.ComponentProps<any>) =>
      ReactModule.createElement('MediaFeatureCard', props),
  };
});

function createHandledRejectedRequest() {
  const request = Promise.reject(new Error('load more failed'));
  request.catch(() => undefined);
  return request;
}

function renderFeedPage() {
  let renderer: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(<FeedPage />);
  });

  return renderer!;
}

function getFlatList(renderer: TestRenderer.ReactTestRenderer) {
  return renderer.root.find((node) => String(node.type) === 'FlatList');
}

async function settlePromises() {
  await act(async () => {
    await Promise.resolve();
  });
}

describe('feed page runtime', () => {
  beforeEach(() => {
    clearPendingRestoreVideoIdMock.mockReset();
    getPendingRestoreVideoIdMock.mockReset();
    getPendingRestoreVideoIdMock.mockReturnValue(null);
    navigateMock.mockReset();
    refreshMock.mockReset();
    requestMoreMock.mockReset();
  });

  it('allows the same tail to request more again after a failed tail-visible request', async () => {
    requestMoreMock.mockImplementation(createHandledRejectedRequest);
    const renderer = renderFeedPage();
    const flatList = getFlatList(renderer);
    const viewableTail = {
      viewableItems: [{ isViewable: true, item: items[1] }],
    };

    act(() => {
      flatList.props.onViewableItemsChanged(viewableTail);
    });
    await settlePromises();
    act(() => {
      flatList.props.onViewableItemsChanged(viewableTail);
    });

    expect(requestMoreMock).toHaveBeenCalledTimes(2);
  });

  it('allows the same tail to request more from onEndReached after a failed request', async () => {
    requestMoreMock.mockImplementation(createHandledRejectedRequest);
    const renderer = renderFeedPage();
    const flatList = getFlatList(renderer);
    const viewableTail = {
      viewableItems: [{ isViewable: true, item: items[1] }],
    };

    act(() => {
      flatList.props.onViewableItemsChanged(viewableTail);
    });
    await settlePromises();
    act(() => {
      flatList.props.onEndReached();
    });

    expect(requestMoreMock).toHaveBeenCalledTimes(2);
  });

  it('does not repeat a successful request for the same tail', async () => {
    requestMoreMock.mockResolvedValue(undefined);
    const renderer = renderFeedPage();
    const flatList = getFlatList(renderer);
    const viewableTail = {
      viewableItems: [{ isViewable: true, item: items[1] }],
    };

    act(() => {
      flatList.props.onViewableItemsChanged(viewableTail);
    });
    await settlePromises();
    act(() => {
      flatList.props.onViewableItemsChanged(viewableTail);
    });
    act(() => {
      flatList.props.onEndReached();
    });

    expect(requestMoreMock).toHaveBeenCalledTimes(1);
  });
});
