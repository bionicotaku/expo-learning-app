import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { WordListSourceItem } from '@/features/word-list-source';

import { WordListPage } from './word-list-page';

const { refreshMock, requestMoreMock, useUnlearnedWordListSourceMock } = vi.hoisted(() => ({
  refreshMock: vi.fn(),
  requestMoreMock: vi.fn(),
  useUnlearnedWordListSourceMock: vi.fn(),
}));

const items: WordListSourceItem[] = [
  {
    id: '1',
    label: 'abandon',
    partOfSpeech: 'verb',
    chineseLabel: '放弃；抛弃',
    progress: 64.25,
  },
];

vi.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

vi.mock('expo-symbols', () => ({
  SymbolView: () => null,
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

vi.mock('@/features/word-list-source', () => ({
  useUnlearnedWordListSource: useUnlearnedWordListSourceMock,
}));

vi.mock('@/shared/theme/editorial-paper', () => ({
  useEditorialPaperTheme: () => ({
    tokens: {
      color: {
        accent: '#000000',
        background: '#ffffff',
        inkMute: '#777777',
        inkSoft: '#333333',
        softAction: {
          butter: '#f5d76e',
          peach: '#f2a27f',
          pistachio: '#9fd7a2',
          rose: '#e67a9e',
        },
        surface: '#ffffff',
      },
      radius: {
        pill: 999,
      },
      spacing: {
        lg: 16,
        md: 12,
        pageTop: 24,
        pageX: 16,
        sm: 8,
        xs: 4,
      },
    },
  }),
}));

vi.mock('@/shared/ui/editorial-paper', async () => {
  const ReactModule = await import('react');

  function HostText({ children, ...props }: React.ComponentProps<any>) {
    return ReactModule.createElement('Text', props, children);
  }

  function HostView({ children, ...props }: React.ComponentProps<any>) {
    return ReactModule.createElement('View', props, children);
  }

  return {
    EditorialTitle: HostText,
    MetaLabel: HostText,
    RaisedSurface: HostView,
    SegmentedFilterBar: HostView,
  };
});

function renderWordListPage() {
  let renderer: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(<WordListPage />);
  });

  return renderer!;
}

function getFlatList(renderer: TestRenderer.ReactTestRenderer) {
  return renderer.root.find((node) => String(node.type) === 'FlatList');
}

describe('word list page runtime', () => {
  beforeEach(() => {
    refreshMock.mockReset();
    requestMoreMock.mockReset();
    useUnlearnedWordListSourceMock.mockReset();
    useUnlearnedWordListSourceMock.mockReturnValue({
      error: null,
      isExtending: false,
      isInitialLoading: false,
      isRefreshing: false,
      items,
      refresh: refreshMock,
      requestMore: requestMoreMock,
    });
  });

  it('renders source items through the FlatList and wires refresh and tail loading', () => {
    const renderer = renderWordListPage();
    const flatList = getFlatList(renderer);

    expect(useUnlearnedWordListSourceMock).toHaveBeenCalled();
    expect(flatList.props.data).toBe(items);
    expect(flatList.props.refreshControl).toBeTruthy();
    expect(flatList.props.onEndReached).toEqual(expect.any(Function));
    expect(flatList.props.ListFooterComponent).toBeNull();

    act(() => {
      flatList.props.refreshControl.props.onRefresh();
      flatList.props.onEndReached();
    });

    expect(refreshMock).toHaveBeenCalledTimes(1);
    expect(requestMoreMock).toHaveBeenCalledTimes(1);
  });

  it('shows an inline loading indicator for the initial in-page loading state', () => {
    useUnlearnedWordListSourceMock.mockReturnValueOnce({
      error: null,
      isExtending: false,
      isInitialLoading: true,
      isRefreshing: false,
      items: [],
      refresh: refreshMock,
      requestMore: requestMoreMock,
    });

    const renderer = renderWordListPage();
    let emptyRenderer: TestRenderer.ReactTestRenderer;

    act(() => {
      emptyRenderer = TestRenderer.create(getFlatList(renderer).props.ListEmptyComponent());
    });

    expect(emptyRenderer!.root.findAll((node) => String(node.type) === 'ActivityIndicator')).toHaveLength(1);
    expect(getFlatList(renderer).props.data).toEqual([]);
  });

  it('shows a footer loading indicator while extending a non-empty list', () => {
    useUnlearnedWordListSourceMock.mockReturnValueOnce({
      error: null,
      isExtending: true,
      isInitialLoading: false,
      isRefreshing: false,
      items,
      refresh: refreshMock,
      requestMore: requestMoreMock,
    });

    const renderer = renderWordListPage();
    const flatList = getFlatList(renderer);

    expect(flatList.props.ListFooterComponent).not.toBeNull();
  });
});
