import { beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import type { VideoListItem } from '@/entities/video';
import { toast } from '@/shared/lib/toast';

import { FeedPage } from './feed-page';

const {
  clearPendingRestoreVideoIdMock,
  getPendingRestoreVideoIdMock,
  navigateMock,
  requestMoreMock,
  refreshMock,
  useFeedSourceMock,
} = vi.hoisted(() => ({
  clearPendingRestoreVideoIdMock: vi.fn(),
  getPendingRestoreVideoIdMock: vi.fn(),
  navigateMock: vi.fn(),
  requestMoreMock: vi.fn(),
  refreshMock: vi.fn(),
  useFeedSourceMock: vi.fn(),
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
    useFeedSource: useFeedSourceMock,
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
    toast.clear();
    useFeedSourceMock.mockReset();
    useFeedSourceMock.mockReturnValue({
      error: null,
      isExtending: false,
      isInitialLoading: false,
      items,
      refresh: refreshMock,
      requestMore: requestMoreMock,
    });
  });

  it('keeps the FlatList shell while the first feed snapshot is loading', () => {
    useFeedSourceMock.mockReturnValue({
      error: null,
      isExtending: false,
      isInitialLoading: true,
      items: [],
      refresh: refreshMock,
      requestMore: requestMoreMock,
    });

    const renderer = renderFeedPage();
    const flatList = getFlatList(renderer);
    let emptyRenderer: TestRenderer.ReactTestRenderer;

    act(() => {
      emptyRenderer = TestRenderer.create(flatList.props.ListEmptyComponent());
    });

    expect(flatList.props.data).toEqual([]);
    expect(emptyRenderer!.root.findAll((node) => String(node.type) === 'ActivityIndicator')).toHaveLength(1);
    expect(emptyRenderer!.root.findByProps({ children: 'Loading video feed...' })).toBeTruthy();
  });

  it('keeps the FlatList shell for initial feed errors without an inline retry action', () => {
    const toastSpy = vi.spyOn(toast, 'show');

    useFeedSourceMock.mockReturnValue({
      error: new Error('feed failed'),
      isExtending: false,
      isInitialLoading: false,
      items: [],
      refresh: refreshMock,
      requestMore: requestMoreMock,
    });

    const renderer = renderFeedPage();
    const flatList = getFlatList(renderer);
    let emptyRenderer: TestRenderer.ReactTestRenderer;

    act(() => {
      emptyRenderer = TestRenderer.create(flatList.props.ListEmptyComponent());
    });

    expect(flatList.props.data).toEqual([]);
    expect(emptyRenderer!.root.findByProps({ children: '加载失败' })).toBeTruthy();
    expect(emptyRenderer!.root.findAllByProps({ accessibilityRole: 'button' })).toHaveLength(0);
    expect(refreshMock).not.toHaveBeenCalled();
    expect(toastSpy).toHaveBeenCalledWith({
      kind: 'error',
      title: '加载失败',
    });
  });

  it('keeps the FlatList shell for an empty feed and wires refresh through the empty component', () => {
    useFeedSourceMock.mockReturnValue({
      error: null,
      isExtending: false,
      isInitialLoading: false,
      items: [],
      refresh: refreshMock,
      requestMore: requestMoreMock,
    });

    const renderer = renderFeedPage();
    const flatList = getFlatList(renderer);
    let emptyRenderer: TestRenderer.ReactTestRenderer;

    act(() => {
      emptyRenderer = TestRenderer.create(flatList.props.ListEmptyComponent());
    });

    expect(flatList.props.data).toEqual([]);
    expect(emptyRenderer!.root.findByProps({ children: 'No clips yet' })).toBeTruthy();

    act(() => {
      emptyRenderer!.root.findByProps({ accessibilityRole: 'button' }).props.onPress();
    });

    expect(refreshMock).toHaveBeenCalledTimes(1);
  });

  it('shows a refresh failure toast when pull refresh fails with existing feed items', async () => {
    const toastSpy = vi.spyOn(toast, 'show');
    toastSpy.mockClear();
    refreshMock.mockRejectedValueOnce(new Error('refresh failed'));

    const renderer = renderFeedPage();
    const flatList = getFlatList(renderer);

    act(() => {
      flatList.props.refreshControl.props.onRefresh();
    });
    await settlePromises();

    expect(refreshMock).toHaveBeenCalledTimes(1);
    expect(toastSpy).toHaveBeenCalledWith({
      kind: 'error',
      title: '刷新失败',
    });
  });

  it('shows refresh failure instead of initial load failure when pull refresh fails from the empty error state', async () => {
    const toastSpy = vi.spyOn(toast, 'show');
    refreshMock.mockRejectedValueOnce(new Error('refresh failed'));
    useFeedSourceMock.mockReturnValue({
      error: new Error('feed failed'),
      isExtending: false,
      isInitialLoading: false,
      items: [],
      refresh: refreshMock,
      requestMore: requestMoreMock,
    });

    const renderer = renderFeedPage();
    const flatList = getFlatList(renderer);
    toastSpy.mockClear();

    act(() => {
      flatList.props.refreshControl.props.onRefresh();
    });
    await settlePromises();

    expect(refreshMock).toHaveBeenCalledTimes(1);
    expect(toastSpy).toHaveBeenCalledTimes(1);
    expect(toastSpy).toHaveBeenCalledWith({
      kind: 'error',
      title: '刷新失败',
    });
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
