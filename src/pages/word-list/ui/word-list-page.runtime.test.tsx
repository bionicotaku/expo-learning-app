import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { WordListSourceItem, WordListSourceResult } from '@/features/word-list-source';
import { toast } from '@/shared/lib/toast';

import { WordListPage } from './word-list-page';

const {
  learnedRefreshMock,
  learnedRequestMoreMock,
  presentWordDetailDialogMock,
  unlearnedRefreshMock,
  unlearnedRequestMoreMock,
  useEmptyWordListSourceMock,
  useLearnedWordListSourceMock,
  useUnlearnedWordListSourceMock,
} = vi.hoisted(() => ({
  learnedRefreshMock: vi.fn(),
  learnedRequestMoreMock: vi.fn(),
  presentWordDetailDialogMock: vi.fn(),
  unlearnedRefreshMock: vi.fn(),
  unlearnedRequestMoreMock: vi.fn(),
  useEmptyWordListSourceMock: vi.fn(),
  useLearnedWordListSourceMock: vi.fn(),
  useUnlearnedWordListSourceMock: vi.fn(),
}));

const unlearnedItems: WordListSourceItem[] = [
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

const learnedItems: WordListSourceItem[] = [
  {
    id: '2',
    label: 'anchor',
    partOfSpeech: 'noun',
    chineseLabel: '锚；固定点',
    chineseDefinition: '表示锚或让事物稳定下来的关键点。',
    coarseUnitId: 2,
    progress: 100,
  },
];

function createSource(
  overrides: Partial<WordListSourceResult> & Pick<WordListSourceResult, 'items'>
): WordListSourceResult {
  return {
    error: null,
    isExtending: false,
    isInitialLoading: false,
    isRefreshing: false,
    refresh: vi.fn(),
    requestMore: vi.fn(),
    ...overrides,
  };
}

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

  class AnimatedValue {
    value: number;

    constructor(value: number) {
      this.value = value;
    }
  }

  return {
    ActivityIndicator: createHostComponent('ActivityIndicator'),
    Animated: {
      Value: AnimatedValue,
      View: createHostComponent('AnimatedView'),
      timing: (value: AnimatedValue, config: { toValue: number }) => ({
        start: () => {
          value.value = config.toValue;
        },
      }),
    },
    FlatList: createHostComponent('FlatList'),
    Pressable: createHostComponent('Pressable'),
    RefreshControl: createHostComponent('RefreshControl'),
    StyleSheet: {
      absoluteFill: {
        bottom: 0,
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
      },
    },
    Text: createHostComponent('Text'),
    View: createHostComponent('View'),
  };
});

vi.mock('@/features/word-list-source', () => ({
  useEmptyWordListSource: useEmptyWordListSourceMock,
  useLearnedWordListSource: useLearnedWordListSourceMock,
  useUnlearnedWordListSource: useUnlearnedWordListSourceMock,
}));

vi.mock('@/features/word-detail', () => ({
  usePresentWordDetailDialog: () => presentWordDetailDialogMock,
}));

vi.mock('@/shared/theme/editorial-paper', () => ({
  editorialPaperCjkTitleFontFamily: 'TW-Kai-98_1',
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

  function SegmentedFilterBar({ children, ...props }: React.ComponentProps<any>) {
    return ReactModule.createElement('SegmentedFilterBar', props, children);
  }

  return {
    EditorialTitle: HostText,
    MetaLabel: HostText,
    RaisedSurface: HostView,
    SegmentedFilterBar,
  };
});

function renderWordListPage() {
  let renderer: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(<WordListPage />);
  });

  return renderer!;
}

function getFlatList(renderer: TestRenderer.ReactTestRenderer, mode: string) {
  return renderer.root.find(
    (node) =>
      String(node.type) === 'FlatList' &&
      node.props.accessibilityLabel === `${mode} word list`
  );
}

function getSegmentedFilterBar(renderer: TestRenderer.ReactTestRenderer) {
  return renderer.root.find((node) => String(node.type) === 'SegmentedFilterBar');
}

async function settlePromises() {
  await act(async () => {
    await Promise.resolve();
  });
}

describe('word list page runtime', () => {
  beforeEach(() => {
    presentWordDetailDialogMock.mockReset();
    unlearnedRefreshMock.mockReset();
    unlearnedRequestMoreMock.mockReset();
    learnedRefreshMock.mockReset();
    learnedRequestMoreMock.mockReset();
    useUnlearnedWordListSourceMock.mockReset();
    useLearnedWordListSourceMock.mockReset();
    useEmptyWordListSourceMock.mockReset();
    toast.clear();
    useUnlearnedWordListSourceMock.mockReturnValue(
      createSource({
        items: unlearnedItems,
        refresh: unlearnedRefreshMock,
        requestMore: unlearnedRequestMoreMock,
      })
    );
    useLearnedWordListSourceMock.mockReturnValue(
      createSource({
        items: learnedItems,
        refresh: learnedRefreshMock,
        requestMore: learnedRequestMoreMock,
      })
    );
    useEmptyWordListSourceMock.mockReturnValue(createSource({ items: [] }));
  });

  afterEach(() => {
    toast.clear();
    vi.restoreAllMocks();
  });

  it('initially enables unlearned data and keeps learned data disabled', () => {
    const renderer = renderWordListPage();

    expect(useUnlearnedWordListSourceMock).toHaveBeenCalledWith({ enabled: true });
    expect(useLearnedWordListSourceMock).toHaveBeenLastCalledWith({ enabled: false });
    expect(useEmptyWordListSourceMock).toHaveBeenCalled();
    expect(getFlatList(renderer, 'unlearned').props.data).toBe(unlearnedItems);
  });

  it('uses the CJK title font for the word-list title and mode labels', () => {
    const renderer = renderWordListPage();

    expect(
      renderer.root.findByProps({ children: '单词列表' }).props.style
    ).toEqual(expect.objectContaining({ fontFamily: 'TW-Kai-98_1' }));
    expect(getSegmentedFilterBar(renderer).props.labelStyle).toEqual({
      fontFamily: 'TW-Kai-98_1',
    });
  });

  it('routes refresh and tail loading to the active unlearned list only', () => {
    const renderer = renderWordListPage();
    const unlearnedList = getFlatList(renderer, 'unlearned');
    const learnedList = getFlatList(renderer, 'learned');

    act(() => {
      unlearnedList.props.refreshControl.props.onRefresh();
      unlearnedList.props.onEndReached();
      learnedList.props.onEndReached();
    });

    expect(unlearnedRefreshMock).toHaveBeenCalledTimes(1);
    expect(unlearnedRequestMoreMock).toHaveBeenCalledTimes(1);
    expect(learnedRequestMoreMock).not.toHaveBeenCalled();
  });

  it('enables and displays learned data after switching to learned', () => {
    const renderer = renderWordListPage();

    act(() => {
      getSegmentedFilterBar(renderer).props.onChange('learned');
    });

    expect(useLearnedWordListSourceMock).toHaveBeenLastCalledWith({ enabled: true });
    expect(getFlatList(renderer, 'learned').props.data).toBe(learnedItems);
  });

  it('keeps progress visible for unlearned rows and hidden for learned rows', () => {
    const renderer = renderWordListPage();
    const unlearnedList = getFlatList(renderer, 'unlearned');
    let rowRenderer: TestRenderer.ReactTestRenderer;

    act(() => {
      rowRenderer = TestRenderer.create(
        unlearnedList.props.renderItem({ item: unlearnedItems[0], index: 0 })
      );
    });

    expect(
      rowRenderer!.root.findByProps({
        accessibilityLabel: 'abandon progress 64.25 percent',
      })
    ).toBeTruthy();

    act(() => {
      getSegmentedFilterBar(renderer).props.onChange('learned');
    });

    const learnedList = getFlatList(renderer, 'learned');

    act(() => {
      rowRenderer = TestRenderer.create(
        learnedList.props.renderItem({ item: learnedItems[0], index: 0 })
      );
    });

    expect(
      rowRenderer!.root.findAllByProps({
        accessibilityLabel: 'anchor progress 100 percent',
      })
    ).toHaveLength(0);
  });

  it('routes refresh and tail loading to the active learned list after switching', () => {
    const renderer = renderWordListPage();

    act(() => {
      getSegmentedFilterBar(renderer).props.onChange('learned');
    });

    const learnedList = getFlatList(renderer, 'learned');
    const unlearnedList = getFlatList(renderer, 'unlearned');

    act(() => {
      learnedList.props.refreshControl.props.onRefresh();
      learnedList.props.onEndReached();
      unlearnedList.props.onEndReached();
    });

    expect(learnedRefreshMock).toHaveBeenCalledTimes(1);
    expect(learnedRequestMoreMock).toHaveBeenCalledTimes(1);
    expect(unlearnedRequestMoreMock).not.toHaveBeenCalled();
  });

  it('shows an empty favorites list without requesting more', () => {
    const renderer = renderWordListPage();

    act(() => {
      getSegmentedFilterBar(renderer).props.onChange('favorites');
    });

    const favoritesList = getFlatList(renderer, 'favorites');

    act(() => {
      favoritesList.props.onEndReached();
    });

    expect(favoritesList.props.data).toEqual([]);
    expect(unlearnedRequestMoreMock).not.toHaveBeenCalled();
    expect(learnedRequestMoreMock).not.toHaveBeenCalled();
  });

  it('opens the shared word detail dialog when a word row is pressed', () => {
    const renderer = renderWordListPage();
    const flatList = getFlatList(renderer, 'unlearned');
    let rowRenderer: TestRenderer.ReactTestRenderer;

    act(() => {
      rowRenderer = TestRenderer.create(
        flatList.props.renderItem({ item: unlearnedItems[0], index: 0 })
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

  it('keeps the active list shell for initial errors without a retry action and shows a load failure toast', () => {
    const toastSpy = vi.spyOn(toast, 'show');
    useUnlearnedWordListSourceMock.mockReturnValueOnce(
      createSource({
        error: new Error('initial failed'),
        items: [],
        refresh: unlearnedRefreshMock,
        requestMore: unlearnedRequestMoreMock,
      })
    );

    const renderer = renderWordListPage();
    const flatList = getFlatList(renderer, 'unlearned');
    let emptyRenderer: TestRenderer.ReactTestRenderer;

    act(() => {
      emptyRenderer = TestRenderer.create(flatList.props.ListEmptyComponent());
    });

    expect(flatList.props.data).toEqual([]);
    expect(emptyRenderer!.root.findByProps({ children: '加载失败' })).toBeTruthy();
    expect(emptyRenderer!.root.findAllByProps({ accessibilityRole: 'button' })).toHaveLength(0);
    expect(toastSpy).toHaveBeenCalledWith({
      kind: 'error',
      title: '加载失败',
    });
  });

  it('does not toast for an inactive initial error until that mode becomes active', () => {
    const toastSpy = vi.spyOn(toast, 'show');
    useLearnedWordListSourceMock.mockReturnValue(
      createSource({
        error: new Error('learned failed'),
        items: [],
        refresh: learnedRefreshMock,
        requestMore: learnedRequestMoreMock,
      })
    );

    const renderer = renderWordListPage();

    expect(toastSpy).not.toHaveBeenCalledWith({
      kind: 'error',
      title: '加载失败',
    });

    act(() => {
      getSegmentedFilterBar(renderer).props.onChange('learned');
    });

    expect(toastSpy).toHaveBeenCalledWith({
      kind: 'error',
      title: '加载失败',
    });
  });

  it('shows a load failure empty state and toast when learned is the active pane', () => {
    const toastSpy = vi.spyOn(toast, 'show');
    useLearnedWordListSourceMock.mockReturnValue(
      createSource({
        error: new Error('learned failed'),
        items: [],
        refresh: learnedRefreshMock,
        requestMore: learnedRequestMoreMock,
      })
    );

    const renderer = renderWordListPage();

    act(() => {
      getSegmentedFilterBar(renderer).props.onChange('learned');
    });

    const learnedList = getFlatList(renderer, 'learned');
    let emptyRenderer: TestRenderer.ReactTestRenderer;

    act(() => {
      emptyRenderer = TestRenderer.create(learnedList.props.ListEmptyComponent());
    });

    expect(learnedList.props.data).toEqual([]);
    expect(emptyRenderer!.root.findByProps({ children: '加载失败' })).toBeTruthy();
    expect(emptyRenderer!.root.findAllByProps({ accessibilityRole: 'button' })).toHaveLength(0);
    expect(toastSpy).toHaveBeenCalledWith({
      kind: 'error',
      title: '加载失败',
    });
  });

  it('shows a refresh failure toast and keeps existing items when pull refresh fails', async () => {
    const toastSpy = vi.spyOn(toast, 'show');
    unlearnedRefreshMock.mockRejectedValueOnce(new Error('refresh failed'));
    const renderer = renderWordListPage();
    const flatList = getFlatList(renderer, 'unlearned');

    act(() => {
      flatList.props.refreshControl.props.onRefresh();
    });
    await settlePromises();

    expect(flatList.props.data).toBe(unlearnedItems);
    expect(unlearnedRefreshMock).toHaveBeenCalledTimes(1);
    expect(toastSpy).toHaveBeenCalledWith({
      kind: 'error',
      title: '刷新失败',
    });
  });

  it('keeps the load failure empty state and only shows refresh failure when empty error refresh fails', async () => {
    const toastSpy = vi.spyOn(toast, 'show');
    useUnlearnedWordListSourceMock.mockReturnValueOnce(
      createSource({
        error: new Error('initial failed'),
        items: [],
        refresh: unlearnedRefreshMock,
        requestMore: unlearnedRequestMoreMock,
      })
    );
    unlearnedRefreshMock.mockRejectedValueOnce(new Error('refresh failed'));
    const renderer = renderWordListPage();
    const flatList = getFlatList(renderer, 'unlearned');
    let emptyRenderer: TestRenderer.ReactTestRenderer;

    act(() => {
      emptyRenderer = TestRenderer.create(flatList.props.ListEmptyComponent());
    });
    expect(emptyRenderer!.root.findByProps({ children: '加载失败' })).toBeTruthy();
    toastSpy.mockClear();

    act(() => {
      flatList.props.refreshControl.props.onRefresh();
    });
    await settlePromises();

    act(() => {
      emptyRenderer = TestRenderer.create(flatList.props.ListEmptyComponent());
    });

    expect(emptyRenderer!.root.findByProps({ children: '加载失败' })).toBeTruthy();
    expect(toastSpy).toHaveBeenCalledTimes(1);
    expect(toastSpy).toHaveBeenCalledWith({
      kind: 'error',
      title: '刷新失败',
    });
  });

  it('keeps favorites as a plain empty state without failure toast', () => {
    const toastSpy = vi.spyOn(toast, 'show');
    const renderer = renderWordListPage();

    act(() => {
      getSegmentedFilterBar(renderer).props.onChange('favorites');
    });

    const favoritesList = getFlatList(renderer, 'favorites');
    let emptyRenderer: TestRenderer.ReactTestRenderer;

    act(() => {
      emptyRenderer = TestRenderer.create(favoritesList.props.ListEmptyComponent());
    });

    expect(emptyRenderer!.root.findByProps({ children: 'No favorites yet' })).toBeTruthy();
    expect(toastSpy).not.toHaveBeenCalled();
  });

  it('allows load more to be triggered again after a previous load-more failure settles', async () => {
    unlearnedRequestMoreMock
      .mockRejectedValueOnce(new Error('append failed'))
      .mockResolvedValueOnce(undefined);
    const renderer = renderWordListPage();
    const flatList = getFlatList(renderer, 'unlearned');

    act(() => {
      flatList.props.onEndReached();
    });
    await settlePromises();
    act(() => {
      flatList.props.onEndReached();
    });

    expect(unlearnedRequestMoreMock).toHaveBeenCalledTimes(2);
  });
});
