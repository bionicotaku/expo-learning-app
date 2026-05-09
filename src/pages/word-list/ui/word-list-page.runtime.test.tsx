import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { WordListSourceItem } from '@/features/word-list-source';

import { WordListPage } from './word-list-page';

const {
  presentWordDetailDialogMock,
  refreshMock,
  requestMoreMock,
  useUnlearnedWordListSourceMock,
} = vi.hoisted(() => ({
  presentWordDetailDialogMock: vi.fn(),
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
    chineseDefinition: '表示放弃某事物、抛弃某人或中止某计划。',
    coarseUnitId: 1,
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

vi.mock('@/features/word-detail', () => ({
  usePresentWordDetailDialog: () => presentWordDetailDialogMock,
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
    presentWordDetailDialogMock.mockReset();
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

  it('opens the shared word detail dialog when a word row is pressed', () => {
    const renderer = renderWordListPage();
    const flatList = getFlatList(renderer);
    let rowRenderer: TestRenderer.ReactTestRenderer;

    act(() => {
      rowRenderer = TestRenderer.create(
        flatList.props.renderItem({ item: items[0], index: 0 })
      );
    });

    const rowPressable = rowRenderer!.root.find(
      (node) => node.props.accessibilityLabel === 'abandon details'
    );

    act(() => {
      rowPressable.props.onPress();
    });

    expect(presentWordDetailDialogMock).toHaveBeenCalledWith({
      title: 'abandon',
      sections: [
        {
          id: 'brief-translation',
          title: '简要翻译',
          body: 'v. 放弃；抛弃',
        },
        {
          id: 'dictionary',
          title: '字典释义',
          body: '表示放弃某事物、抛弃某人或中止某计划。',
        },
      ],
    });
  });

  it('passes an empty brief translation when the word has no chinese label', () => {
    useUnlearnedWordListSourceMock.mockReturnValueOnce({
      error: null,
      isExtending: false,
      isInitialLoading: false,
      isRefreshing: false,
      items: [
        {
          ...items[0],
          id: '2',
          label: 'wander',
          chineseLabel: '',
          partOfSpeech: 'verb',
        },
      ],
      refresh: refreshMock,
      requestMore: requestMoreMock,
    });
    const renderer = renderWordListPage();
    const flatList = getFlatList(renderer);
    let rowRenderer: TestRenderer.ReactTestRenderer;

    act(() => {
      rowRenderer = TestRenderer.create(
        flatList.props.renderItem({ item: flatList.props.data[0], index: 0 })
      );
    });

    const rowPressable = rowRenderer!.root.find(
      (node) => node.props.accessibilityLabel === 'wander details'
    );

    act(() => {
      rowPressable.props.onPress();
    });

    expect(presentWordDetailDialogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        sections: expect.arrayContaining([
          {
            id: 'brief-translation',
            title: '简要翻译',
            body: '',
          },
        ]),
      })
    );
  });
});
