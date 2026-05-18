import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ChoiceQuestionData } from '../model/types';
import { ChoiceQuestionSetDialogContent } from './choice-question-set-dialog-content';

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
    Text: createHostComponent('Text'),
    View: createHostComponent('View'),
  };
});

vi.mock('react-native-reanimated', async () => {
  const ReactModule = await import('react');

  function createAnimatedComponent(displayName: string) {
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
    __esModule: true,
    default: {
      View: createAnimatedComponent('AnimatedView'),
    },
    Easing: {
      cubic: 'cubic',
      out: (value: unknown) => value,
    },
    useAnimatedStyle: (updater: () => Record<string, unknown>) => updater(),
    useSharedValue: <T,>(value: T) => ({ value }),
    withDelay: <T,>(_delayMs: number, value: T) => value,
    withTiming: <T,>(value: T) => value,
  };
});

vi.mock('@/shared/theme/editorial-paper', () => ({
  useEditorialPaperTheme: () => ({
    tokens: {
      color: {
        ink: '#1C1A17',
        inkMute: '#8B8377',
        inkSoft: '#4A453E',
        lineSoft: 'rgba(28,26,23,0.12)',
        softAction: {
          pistachio: '#CFE0B8',
          rose: '#E8B8C0',
        },
        surface: '#FBF7EE',
      },
      radius: {
        control: 16,
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

const questions: ChoiceQuestionData[] = [
  {
    id: 'context-meaning',
    kind: 'context_meaning',
    title: 'barely',
    prompt: '这里的 “barely” 最接近什么意思？',
    contextText: 'I barely made it to the meeting on time.',
    targetText: 'barely',
    answerDetail: {
      label: 'barely',
      pos: 'adv.',
      chineseLabel: '几乎不 / 勉强',
      explanation: '在这个句子里，barely 表示勉强赶上，强调差一点没做到。',
    },
    options: [
      {
        id: 'q1-correct',
        label: '几乎不 / 勉强',
        isCorrect: true,
      },
      {
        id: 'q1-wrong',
        label: '非常快',
        isCorrect: false,
      },
    ],
  },
  {
    id: 'context-cloze',
    kind: 'context_cloze',
    prompt: '根据语境选回被隐去的词。',
    contextText: 'I _____ made it to the meeting on time.',
    answerDetail: {
      label: 'barely',
      pos: 'adv.',
      chineseLabel: '几乎不 / 勉强',
      explanation: '空格里需要 barely，因为它表达勉强准时赶到。',
    },
    options: [
      {
        id: 'q2-correct',
        label: 'barely',
        isCorrect: true,
      },
      {
        id: 'q2-wrong',
        label: 'loudly',
        isCorrect: false,
      },
    ],
  },
];

function renderSet(
  payload: {
    questions: ChoiceQuestionData[];
    showProgress?: boolean;
  },
  props: { onDismiss?: () => void } = {}
) {
  let renderer: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(
      <ChoiceQuestionSetDialogContent payload={payload} {...props} />
    );
  });

  return renderer!;
}

function findNodesWithText(renderer: TestRenderer.ReactTestRenderer, text: string) {
  return renderer.root
    .findAll((node) => typeof node.type === 'string')
    .filter((node) => node.props.children === text);
}

function findOption(
  renderer: TestRenderer.ReactTestRenderer,
  optionId: string
) {
  return renderer.root.findByProps({ testID: `choice-option-${optionId}` });
}

function findButtonByLabel(
  renderer: TestRenderer.ReactTestRenderer,
  accessibilityLabel: string
) {
  return renderer.root.findByProps({ accessibilityLabel });
}

function findAllByTestID(
  renderer: TestRenderer.ReactTestRenderer,
  testID: string
) {
  return renderer.root
    .findAllByProps({ testID })
    .filter((node) => typeof node.type === 'string');
}

describe('ChoiceQuestionSetDialogContent runtime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('renders the current question with kind, title, prompt, context, numbered options, and close button', () => {
    const renderer = renderSet({ questions, showProgress: true });

    expect(findNodesWithText(renderer, '语境释义选择题')).toHaveLength(1);
    expect(findNodesWithText(renderer, '1/2')).toHaveLength(1);
    expect(findNodesWithText(renderer, '×')).toHaveLength(1);
    expect(findNodesWithText(renderer, 'barely')).toHaveLength(1);
    expect(findNodesWithText(renderer, '这里的 “barely” 最接近什么意思？')).toHaveLength(1);
    expect(findNodesWithText(renderer, 'I barely made it to the meeting on time.')).toHaveLength(1);
    expect(findNodesWithText(renderer, '几乎不 / 勉强')).toHaveLength(1);
    expect(findNodesWithText(renderer, '非常快')).toHaveLength(1);
    expect(findNodesWithText(renderer, '1')).toHaveLength(1);
    expect(findNodesWithText(renderer, '2')).toHaveLength(1);
  });

  it('omits progress when showProgress is false', () => {
    const renderer = renderSet({ questions, showProgress: false });

    expect(findNodesWithText(renderer, '1/2')).toHaveLength(0);
  });

  it('calls the provided dismiss handler from the top-right close button', () => {
    const onDismiss = vi.fn();
    const renderer = renderSet({ questions, showProgress: true }, { onDismiss });

    act(() => {
      findButtonByLabel(renderer, '关闭题目弹窗').props.onPress();
    });

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('auto-advances after a first-try correct answer', () => {
    const renderer = renderSet({ questions, showProgress: true });

    act(() => {
      findOption(renderer, 'q1-correct').props.onPress();
    });

    expect(findOption(renderer, 'q1-correct').props.accessibilityState).toEqual({
      disabled: true,
      selected: true,
    });
    expect(findNodesWithText(renderer, '根据语境选回被隐去的词。')).toHaveLength(0);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(findNodesWithText(renderer, '2/2')).toHaveLength(1);
    expect(findNodesWithText(renderer, '根据语境选回被隐去的词。')).toHaveLength(1);
    expect(findNodesWithText(renderer, '答案解析')).toHaveLength(0);
  });

  it('keeps the dialog chrome stable and makes previous question content inert during crossfade', () => {
    const renderer = renderSet({ questions, showProgress: true });

    expect(findAllByTestID(renderer, 'choice-question-dialog-chrome')).toHaveLength(1);

    act(() => {
      findOption(renderer, 'q1-correct').props.onPress();
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(findAllByTestID(renderer, 'choice-question-dialog-chrome')).toHaveLength(1);
    expect(findNodesWithText(renderer, '2/2')).toHaveLength(1);

    const previousContent = findAllByTestID(
      renderer,
      'question-content-previous'
    );

    expect(previousContent).toHaveLength(1);
    expect(previousContent[0].props.pointerEvents).toBe('none');
    expect(previousContent[0].props.accessibilityElementsHidden).toBe(true);
    expect(previousContent[0].props.importantForAccessibility).toBe(
      'no-hide-descendants'
    );
  });

  it('dismisses after a first-try correct answer on the final single question', () => {
    const onDismiss = vi.fn();
    const renderer = renderSet(
      { questions: [questions[0]], showProgress: false },
      { onDismiss }
    );

    act(() => {
      findOption(renderer, 'q1-correct').props.onPress();
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('marks a wrong option without revealing the correct answer and keeps choices enabled', () => {
    const renderer = renderSet({ questions, showProgress: true });

    act(() => {
      findOption(renderer, 'q1-wrong').props.onPress();
    });

    expect(findOption(renderer, 'q1-wrong').props.accessibilityState).toEqual({
      disabled: false,
      selected: true,
    });
    expect(findOption(renderer, 'q1-wrong').props.accessibilityLabel).toContain(
      '回答错误'
    );
    expect(findOption(renderer, 'q1-correct').props.accessibilityState).toEqual({
      disabled: false,
      selected: false,
    });
    expect(findNodesWithText(renderer, '答案解析')).toHaveLength(0);

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(findNodesWithText(renderer, '这里的 “barely” 最接近什么意思？')).toHaveLength(1);
  });

  it('shows answer detail after wrong then correct and waits for the manual next button', () => {
    const renderer = renderSet({ questions, showProgress: true });

    act(() => {
      findOption(renderer, 'q1-wrong').props.onPress();
    });
    act(() => {
      findOption(renderer, 'q1-correct').props.onPress();
    });

    expect(findNodesWithText(renderer, '答案解析')).toHaveLength(1);
    expect(findNodesWithText(renderer, 'adv.')).toHaveLength(1);
    expect(findNodesWithText(renderer, '在这个句子里，barely 表示勉强赶上，强调差一点没做到。')).toHaveLength(1);
    expect(findNodesWithText(renderer, '下一个')).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(findNodesWithText(renderer, '这里的 “barely” 最接近什么意思？')).toHaveLength(1);

    act(() => {
      findButtonByLabel(renderer, '下一个').props.onPress();
    });

    expect(findNodesWithText(renderer, '2/2')).toHaveLength(1);
    expect(findNodesWithText(renderer, '这里的 “barely” 最接近什么意思？')).toHaveLength(1);
    expect(findNodesWithText(renderer, '根据语境选回被隐去的词。')).toHaveLength(1);
    expect(findAllByTestID(renderer, 'question-content-previous')).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(260);
    });

    expect(findNodesWithText(renderer, '答案解析')).toHaveLength(0);
    expect(findAllByTestID(renderer, 'question-content-previous')).toHaveLength(0);
    expect(findOption(renderer, 'q2-correct').props.accessibilityState).toEqual({
      disabled: false,
      selected: false,
    });
  });

  it('closes from the final answer detail action', () => {
    const onDismiss = vi.fn();
    const renderer = renderSet(
      { questions: [questions[0]], showProgress: false },
      { onDismiss }
    );

    act(() => {
      findOption(renderer, 'q1-wrong').props.onPress();
    });
    act(() => {
      findOption(renderer, 'q1-correct').props.onPress();
    });

    expect(findNodesWithText(renderer, '完成')).toHaveLength(1);

    act(() => {
      findButtonByLabel(renderer, '完成').props.onPress();
    });

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
