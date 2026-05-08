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
  index,
  text,
}: {
  coarseId: number | null;
  index: number;
  text: string;
}): TranscriptToken {
  return {
    end: 1800,
    explanation: `${text} explanation`,
    index,
    semanticElement: {
      baseForm: text.toLowerCase(),
      coarseId,
      dictionary: `${text} dictionary`,
      reason: `${text} reason`,
    },
    start: 1000,
    text,
  };
}

function createStoreAtCurrentSentence() {
  const store = createRowPlaybackSeekBarStore();

  store.setProgressSnapshot({
    bufferedPositionSeconds: 2,
    bufferedRatio: 0.2,
    currentTimeSeconds: 1.5,
    durationSeconds: 10,
    playedRatio: 0.15,
  });

  return store;
}

function findTextNode(renderer: TestRenderer.ReactTestRenderer, text: string) {
  return renderer.root
    .findAllByType(Text)
    .find((node) => node.props.children === text);
}

describe('basic subtitle overlay runtime', () => {
  it('renders current sentence tokens and only sends clickable coarse-id tokens to the press handler', () => {
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
          maxTextWidth={240}
          onTokenPress={onTokenPress}
          seekBarStore={createStoreAtCurrentSentence()}
          transcript={transcript}
        />
      );
    });

    const clickableNode = findTextNode(renderer!, 'Making ');
    const nullCoarseIdNode = findTextNode(renderer!, 'Pam');

    expect(clickableNode?.props.onPress).toEqual(expect.any(Function));
    expect(nullCoarseIdNode?.props.onPress).toBeUndefined();

    act(() => {
      clickableNode!.props.onPress({
        stopPropagation,
      });
    });

    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(onTokenPress).toHaveBeenCalledWith(clickableToken);
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
          maxTextWidth={240}
          onTokenPress={vi.fn()}
          seekBarStore={createStoreAtCurrentSentence()}
          transcript={transcript}
        />
      );
    });

    expect(findTextNode(renderer!, 'Plain fallback sentence.')).toBeTruthy();
  });
});
