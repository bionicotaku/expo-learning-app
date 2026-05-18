import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  WordDetailDialogContent,
  type WordDetailDialogData,
} from './word-detail-dialog-content';

const mocks = vi.hoisted(() => ({
  playerPlay: vi.fn(),
  playerPause: vi.fn(),
  toastShow: vi.fn(),
  useEventListener: vi.fn(),
  useEventStatus: 'readyToPlay',
  useVideoPlayer: vi.fn(),
}));

const playerPlay = mocks.playerPlay;
const playerPause = mocks.playerPause;
const toastShow = mocks.toastShow;
const useVideoPlayerMock = mocks.useVideoPlayer;

vi.mock('react-native', async () => {
  const ReactModule = await import('react');

  function createHostComponent(displayName: string) {
    const Component = ReactModule.forwardRef<any, any>(
      ({ children, ...props }, ref) =>
        ReactModule.createElement(
          displayName,
          { ...props, ref },
          children as React.ReactNode
        )
    );

    Component.displayName = displayName;

    return Component;
  }

  return {
    Pressable: createHostComponent('Pressable'),
    ScrollView: createHostComponent('ScrollView'),
    Text: createHostComponent('Text'),
    View: createHostComponent('View'),
  };
});

vi.mock('expo', () => ({
  useEvent: () => ({
    status: mocks.useEventStatus,
    error: undefined,
  }),
  useEventListener: mocks.useEventListener,
}));

vi.mock('expo-symbols', async () => {
  const ReactModule = await import('react');

  return {
    SymbolView: ({ fallback, ...props }: any) =>
      ReactModule.createElement('SymbolView', props, fallback),
  };
});

vi.mock('expo-video', () => ({
  useVideoPlayer: (...args: unknown[]) => useVideoPlayerMock(...args),
}));

vi.mock('@/shared/lib/toast', () => ({
  toast: {
    show: mocks.toastShow,
  },
}));

vi.mock('@/shared/theme/editorial-paper', () => ({
  useEditorialPaperTheme: () => ({
    tokens: {
      color: {
        ink: '#1C1A17',
        inkMute: '#8B8377',
        inkSoft: '#4A453E',
        softAction: {
          butter: '#F2DF9C',
          pistachio: '#CFE0B8',
          rose: '#E8B8C0',
        },
        surface: '#FBF7EE',
      },
      radius: {
        pill: 999,
      },
      spacing: {
        lg: 24,
        md: 16,
        sm: 12,
        xs: 6,
      },
    },
  }),
}));

vi.mock('@/shared/ui/editorial-paper', async () => {
  const ReactModule = await import('react');

  return {
    EditorialTitle: ({ children, ...props }: React.PropsWithChildren) =>
      ReactModule.createElement('EditorialTitle', props, children),
    MetaLabel: ({ children, ...props }: React.PropsWithChildren) =>
      ReactModule.createElement('MetaLabel', props, children),
  };
});

const basePayload: WordDetailDialogData = {
  title: 'Making',
  subtitle: 'make',
  sections: [
    {
      id: 'context',
      title: '上下文释义',
      body: '上下文里的 make 表示制作。',
    },
  ],
};

function renderContent(payload: WordDetailDialogData) {
  let renderer: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(<WordDetailDialogContent payload={payload} />);
  });

  return renderer!;
}

function findTextNodes(renderer: TestRenderer.ReactTestRenderer, text: string) {
  return renderer.root
    .findAll((node) => String(node.type) === 'Text')
    .filter((node) => node.props.children === text);
}

function findSentenceAudioButtons(renderer: TestRenderer.ReactTestRenderer) {
  return renderer.root
    .findAllByProps({ accessibilityLabel: '播放本句音频' })
    .filter((node) => String(node.type) === 'Pressable');
}

function findWordAudioButtons(renderer: TestRenderer.ReactTestRenderer) {
  return renderer.root
    .findAllByProps({ accessibilityLabel: '播放单词音频' })
    .filter((node) => String(node.type) === 'Pressable');
}

function findFavoriteButtons(renderer: TestRenderer.ReactTestRenderer) {
  return renderer.root
    .findAll(
      (node) =>
        String(node.type) === 'Pressable' &&
        (node.props.accessibilityLabel === '收藏单词' ||
          node.props.accessibilityLabel === '取消收藏单词')
    );
}

describe('WordDetailDialogContent runtime', () => {
  beforeEach(() => {
    playerPause.mockReset();
    playerPlay.mockReset();
    toastShow.mockReset();
    mocks.useEventListener.mockReset();
    mocks.useEventStatus = 'readyToPlay';
    useVideoPlayerMock.mockReset();
  });

  it('does not render learning feedback buttons', () => {
    const renderer = renderContent(basePayload);

    expect(findTextNodes(renderer, '认识')).toHaveLength(0);
    expect(findTextNodes(renderer, '模糊')).toHaveLength(0);
    expect(findTextNodes(renderer, '不认识')).toHaveLength(0);
    expect(findWordAudioButtons(renderer)).toHaveLength(0);
    expect(findSentenceAudioButtons(renderer)).toHaveLength(0);
    expect(useVideoPlayerMock).not.toHaveBeenCalled();
  });

  it('labels word and sentence audio buttons with visible scope badges', () => {
    const renderer = renderContent({
      ...basePayload,
      audio: {
        videoUrl: 'https://example.com/video.m3u8',
        word: {
          endMs: 1350,
          startMs: 1100,
        },
        sentence: {
          endMs: 2400,
          startMs: 1200,
        },
      },
    });

    expect(findWordAudioButtons(renderer)).toHaveLength(1);
    expect(findSentenceAudioButtons(renderer)).toHaveLength(1);
    expect(findTextNodes(renderer, '词')).toHaveLength(1);
    expect(findTextNodes(renderer, '句')).toHaveLength(1);
  });

  it('toggles the local favorite button color state only', () => {
    const renderer = renderContent(basePayload);
    const [button] = findFavoriteButtons(renderer);

    expect(button?.props.accessibilityLabel).toBe('收藏单词');
    expect(button?.props.accessibilityState).toEqual({ selected: false });

    act(() => {
      button!.props.onPress();
    });

    const [selectedButton] = findFavoriteButtons(renderer);
    expect(selectedButton?.props.accessibilityLabel).toBe('取消收藏单词');
    expect(selectedButton?.props.accessibilityState).toEqual({ selected: true });
    expect(toastShow).not.toHaveBeenCalled();
  });

  it('renders an optional sentence audio button beside the subtitle', () => {
    const renderer = renderContent({
      ...basePayload,
      audio: {
        videoUrl: 'https://example.com/video.m3u8',
        sentence: {
          endMs: 2400,
          startMs: 1200,
        },
      },
    });

    expect(findTextNodes(renderer, 'make')).toHaveLength(1);
    expect(findWordAudioButtons(renderer)).toHaveLength(0);
    expect(findSentenceAudioButtons(renderer)).toHaveLength(1);
  });

  it('renders word and sentence audio buttons that share one headless player', () => {
    const player = {
      currentTime: 0,
      pause: playerPause,
      play: playerPlay,
      status: 'readyToPlay',
      timeUpdateEventInterval: 0,
    };
    useVideoPlayerMock.mockReturnValue(player);
    const renderer = renderContent({
      ...basePayload,
      audio: {
        videoUrl: 'https://example.com/video.m3u8',
        word: {
          endMs: 1350,
          startMs: 1100,
        },
        sentence: {
          endMs: 2400,
          startMs: 1200,
        },
      },
    });
    const [wordButton] = findWordAudioButtons(renderer);
    const [sentenceButton] = findSentenceAudioButtons(renderer);

    act(() => {
      wordButton!.props.onPress();
    });
    expect(player.currentTime).toBe(1.1);

    act(() => {
      sentenceButton!.props.onPress();
    });
    expect(player.currentTime).toBe(1.2);

    act(() => {
      wordButton!.props.onPress();
    });

    expect(useVideoPlayerMock).toHaveBeenCalledWith(
      {
        contentType: 'hls',
        uri: 'https://example.com/video.m3u8',
      },
      expect.any(Function)
    );
    expect(findWordAudioButtons(renderer)).toHaveLength(1);
    expect(findSentenceAudioButtons(renderer)).toHaveLength(1);
    expect(player.currentTime).toBe(1.1);
    expect(playerPlay).toHaveBeenCalledTimes(3);
  });

  it('shows an audio load failure toast once for an errored play request', () => {
    mocks.useEventStatus = 'error';
    const player = {
      currentTime: 0,
      pause: playerPause,
      play: playerPlay,
      status: 'error',
      timeUpdateEventInterval: 0,
    };
    useVideoPlayerMock.mockReturnValue(player);
    const payload: WordDetailDialogData = {
      ...basePayload,
      audio: {
        videoUrl: 'https://example.com/video.m3u8',
        sentence: {
          endMs: 2400,
          startMs: 1200,
        },
      },
    };
    const renderer = renderContent(payload);
    const [button] = findSentenceAudioButtons(renderer);

    act(() => {
      button!.props.onPress();
    });
    act(() => {
      renderer.update(<WordDetailDialogContent payload={payload} />);
    });

    expect(toastShow).toHaveBeenCalledTimes(1);
    expect(toastShow).toHaveBeenCalledWith({
      kind: 'error',
      title: '音频加载失败',
    });
  });

  it('shows an audio load failure toast when playback throws', () => {
    const player = {
      currentTime: 0,
      pause: playerPause,
      play: playerPlay.mockImplementation(() => {
        throw new Error('play failed');
      }),
      status: 'readyToPlay',
      timeUpdateEventInterval: 0,
    };
    useVideoPlayerMock.mockReturnValue(player);
    const renderer = renderContent({
      ...basePayload,
      audio: {
        videoUrl: 'https://example.com/video.m3u8',
        sentence: {
          endMs: 2400,
          startMs: 1200,
        },
      },
    });
    const [button] = findSentenceAudioButtons(renderer);

    act(() => {
      button!.props.onPress();
    });

    expect(toastShow).toHaveBeenCalledTimes(1);
    expect(toastShow).toHaveBeenCalledWith({
      kind: 'error',
      title: '音频加载失败',
    });
  });

  it('does not call the headless player after unmounting the sentence audio component', () => {
    const player = {
      currentTime: 0,
      pause: playerPause,
      play: playerPlay,
      status: 'readyToPlay',
      timeUpdateEventInterval: 0,
    };
    useVideoPlayerMock.mockReturnValue(player);
    const renderer = renderContent({
      ...basePayload,
      audio: {
        videoUrl: 'https://example.com/video.m3u8',
        sentence: {
          endMs: 2400,
          startMs: 1200,
        },
      },
    });
    const [button] = findSentenceAudioButtons(renderer);

    act(() => {
      button!.props.onPress();
    });
    playerPause.mockClear();

    act(() => {
      renderer.unmount();
    });

    expect(playerPause).not.toHaveBeenCalled();
  });
});
