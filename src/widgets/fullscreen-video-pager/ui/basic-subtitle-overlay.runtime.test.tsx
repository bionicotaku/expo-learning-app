import React from 'react';
import { Text } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { describe, expect, it, vi } from 'vitest';

import type { Transcript, TranscriptToken } from '@/entities/transcript';
import { createRowPlaybackSeekBarStore } from '../model/row-playback-seek-bar-store';

import { BasicSubtitleOverlay } from './basic-subtitle-overlay';

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
    Text: createHostComponent('Text'),
    View: createHostComponent('View'),
  };
});

function createToken({
  coarseId,
  end = 1800,
  index,
  start = 1000,
  text,
}: {
  coarseId: number | null;
  end?: number;
  index: number;
  start?: number;
  text: string;
}): TranscriptToken {
  return {
    end,
    explanation: `${text} explanation`,
    index,
    semanticElement: {
      baseForm: text.toLowerCase(),
      coarseId,
      dictionary: `${text} dictionary`,
      reason: `${text} reason`,
    },
    start,
    text,
  };
}

function createStoreAtCurrentSecond(currentTimeSeconds = 1.5) {
  const store = createRowPlaybackSeekBarStore();

  store.setProgressSnapshot({
    bufferedPositionSeconds: 2,
    bufferedRatio: 0.2,
    currentTimeSeconds,
    durationSeconds: 10,
    playedRatio: currentTimeSeconds / 10,
  });

  return store;
}

function findTextNode(renderer: TestRenderer.ReactTestRenderer, text: string) {
  return renderer.root
    .findAllByType(Text)
    .find((node) => node.props.children === text);
}

describe('basic subtitle overlay runtime', () => {
  it('renders current sentence tokens and sends every token to the press handler', () => {
    const clickableToken = createToken({
      coarseId: 108404,
      index: 0,
      text: 'Making',
    });
    const nullCoarseIdToken = createToken({
      coarseId: null,
      index: 1,
      text: 'Pam',
    });
    const transcript: Transcript = {
      sentences: [
        {
          end: 2000,
          explanation: 'sentence explanation',
          index: 0,
          start: 1000,
          text: 'Making Pam.',
          tokens: [clickableToken, nullCoarseIdToken],
        },
      ],
    };
    const onTokenPress = vi.fn();
    const stopPropagation = vi.fn();
    let renderer: TestRenderer.ReactTestRenderer;

    act(() => {
      renderer = TestRenderer.create(
        <BasicSubtitleOverlay
          displayMode="english"
          maxTextWidth={240}
          onTokenPress={onTokenPress}
          seekBarStore={createStoreAtCurrentSecond()}
          transcript={transcript}
        />
      );
    });

    const clickableNode = findTextNode(renderer!, 'Making ');
    const nullCoarseIdNode = findTextNode(renderer!, 'Pam');

    expect(clickableNode?.props.onPress).toEqual(expect.any(Function));
    expect(nullCoarseIdNode?.props.onPress).toEqual(expect.any(Function));

    act(() => {
      clickableNode!.props.onPress({
        stopPropagation,
      });
    });
    act(() => {
      nullCoarseIdNode!.props.onPress({
        stopPropagation,
      });
    });

    expect(stopPropagation).toHaveBeenCalledTimes(2);
    expect(onTokenPress).toHaveBeenCalledWith(clickableToken);
    expect(onTokenPress).toHaveBeenCalledWith(nullCoarseIdToken);
  });

  it('highlights the current token without changing non-current token styles', () => {
    const firstToken = createToken({
      coarseId: 108404,
      end: 1400,
      index: 0,
      text: 'Making',
    });
    const currentNullCoarseIdToken = createToken({
      coarseId: null,
      end: 1800,
      index: 1,
      start: 1400,
      text: 'Pam',
    });
    const transcript: Transcript = {
      sentences: [
        {
          end: 2000,
          explanation: 'sentence explanation',
          index: 0,
          start: 1000,
          text: 'Making Pam.',
          tokens: [firstToken, currentNullCoarseIdToken],
        },
      ],
    };
    const onTokenPress = vi.fn();
    const stopPropagation = vi.fn();
    let renderer: TestRenderer.ReactTestRenderer;

    act(() => {
      renderer = TestRenderer.create(
        <BasicSubtitleOverlay
          displayMode="english"
          maxTextWidth={240}
          onTokenPress={onTokenPress}
          seekBarStore={createStoreAtCurrentSecond()}
          transcript={transcript}
        />
      );
    });

    const firstNode = findTextNode(renderer!, 'Making ');
    const currentNode = findTextNode(renderer!, 'Pam');

    expect(firstNode?.props.style).toBeUndefined();
    expect(currentNode?.props.style).toMatchObject({
      color: 'rgba(255,226,135,0.98)',
      textShadowColor: 'rgba(74,44,0,0.42)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    });

    act(() => {
      currentNode!.props.onPress({
        stopPropagation,
      });
    });

    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(onTokenPress).toHaveBeenCalledWith(currentNullCoarseIdToken);
  });

  it('falls back to the sentence text when a current sentence has no tokens', () => {
    const transcript: Transcript = {
      sentences: [
        {
          end: 2000,
          explanation: 'sentence explanation',
          index: 0,
          start: 1000,
          text: 'Plain fallback sentence.',
          tokens: [],
        },
      ],
    };
    let renderer: TestRenderer.ReactTestRenderer;

    act(() => {
      renderer = TestRenderer.create(
        <BasicSubtitleOverlay
          displayMode="english"
          maxTextWidth={240}
          onTokenPress={vi.fn()}
          seekBarStore={createStoreAtCurrentSecond()}
          transcript={transcript}
        />
      );
    });

    expect(findTextNode(renderer!, 'Plain fallback sentence.')).toBeTruthy();
  });

  it('renders the current sentence explanation below the English subtitle in bilingual mode', () => {
    const transcript: Transcript = {
      sentences: [
        {
          end: 2000,
          explanation: '这是一句中文解释。',
          index: 0,
          start: 1000,
          text: 'Plain fallback sentence.',
          tokens: [],
        },
      ],
    };
    let renderer: TestRenderer.ReactTestRenderer;

    act(() => {
      renderer = TestRenderer.create(
        <BasicSubtitleOverlay
          displayMode="bilingual"
          maxTextWidth={240}
          onTokenPress={vi.fn()}
          seekBarStore={createStoreAtCurrentSecond()}
          transcript={transcript}
        />
      );
    });

    expect(findTextNode(renderer!, 'Plain fallback sentence.')).toBeTruthy();
    expect(findTextNode(renderer!, '这是一句中文解释。')).toBeTruthy();
    expect(findTextNode(renderer!, '这是一句中文解释。')?.props.onPress).toBeUndefined();
  });

  it('updates the active token within the same sentence while reusing token display parts', () => {
    const firstToken = createToken({
      coarseId: 108404,
      end: 1400,
      index: 0,
      text: 'Making',
    });
    const secondToken = createToken({
      coarseId: null,
      end: 1800,
      index: 1,
      start: 1400,
      text: 'Pam',
    });
    const transcript: Transcript = {
      sentences: [
        {
          end: 2000,
          explanation: 'sentence explanation',
          index: 0,
          start: 1000,
          text: 'Making Pam.',
          tokens: [firstToken, secondToken],
        },
      ],
    };
    const store = createStoreAtCurrentSecond(1.1);
    let renderer: TestRenderer.ReactTestRenderer;

    act(() => {
      renderer = TestRenderer.create(
        <BasicSubtitleOverlay
          displayMode="english"
          maxTextWidth={240}
          onTokenPress={vi.fn()}
          seekBarStore={store}
          transcript={transcript}
        />
      );
    });

    expect(findTextNode(renderer!, 'Making ')?.props.style).toMatchObject({
      color: 'rgba(255,226,135,0.98)',
    });
    expect(findTextNode(renderer!, 'Pam')?.props.style).toBeUndefined();

    act(() => {
      store.setProgressSnapshot({
        bufferedPositionSeconds: 2,
        bufferedRatio: 0.2,
        currentTimeSeconds: 1.5,
        durationSeconds: 10,
        playedRatio: 0.15,
      });
    });

    expect(findTextNode(renderer!, 'Making ')?.props.style).toBeUndefined();
    expect(findTextNode(renderer!, 'Pam')?.props.style).toMatchObject({
      color: 'rgba(255,226,135,0.98)',
    });
  });
});
