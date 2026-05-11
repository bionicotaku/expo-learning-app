import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { describe, expect, it, vi } from 'vitest';

import {
  ChoiceQuestionDialogContent,
  type ChoiceQuestionDialogData,
} from './choice-question-dialog-content';

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

  const chainableAnimation = {
    delay: () => chainableAnimation,
    duration: () => chainableAnimation,
    easing: () => chainableAnimation,
  };

  return {
    __esModule: true,
    default: {
      View: createAnimatedComponent('AnimatedView'),
    },
    Easing: {
      cubic: 'cubic',
      out: (value: unknown) => value,
    },
    FadeIn: chainableAnimation,
    LinearTransition: chainableAnimation,
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
        cardSm: 12,
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

const basePayload: ChoiceQuestionDialogData = {
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
      id: 'correct',
      label: '几乎不 / 勉强',
      isCorrect: true,
    },
    {
      id: 'wrong',
      label: '非常快',
      isCorrect: false,
    },
  ],
};

function renderContent(payload: ChoiceQuestionDialogData) {
  let renderer: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(
      <ChoiceQuestionDialogContent payload={payload} />
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

describe('ChoiceQuestionDialogContent runtime', () => {
  it('renders the question kind, title, prompt, context, and options', () => {
    const renderer = renderContent(basePayload);

    expect(findNodesWithText(renderer, '语境释义选择题')).toHaveLength(1);
    expect(findNodesWithText(renderer, 'barely')).toHaveLength(1);
    expect(findNodesWithText(renderer, '这里的 “barely” 最接近什么意思？')).toHaveLength(1);
    expect(findNodesWithText(renderer, 'I barely made it to the meeting on time.')).toHaveLength(1);
    expect(findNodesWithText(renderer, '几乎不 / 勉强')).toHaveLength(1);
    expect(findNodesWithText(renderer, '非常快')).toHaveLength(1);
    expect(findNodesWithText(renderer, '1')).toHaveLength(1);
    expect(findNodesWithText(renderer, '2')).toHaveLength(1);
  });

  it('omits the large title when the question payload has no title', () => {
    const renderer = renderContent({
      ...basePayload,
      kind: 'context_cloze',
      title: undefined,
      contextText: 'I _____ made it to the meeting on time.',
      prompt: '根据语境选回被隐去的词。',
    });

    expect(
      renderer.root.findAll((node) => String(node.type) === 'EditorialTitle')
    ).toHaveLength(0);
    expect(findNodesWithText(renderer, 'I _____ made it to the meeting on time.')).toHaveLength(1);
    expect(findNodesWithText(renderer, '根据语境选回被隐去的词。')).toHaveLength(1);
  });

  it('keeps every option neutral before selection', () => {
    const renderer = renderContent(basePayload);

    expect(findOption(renderer, 'correct').props.accessibilityState).toEqual({
      disabled: false,
      selected: false,
    });
    expect(findOption(renderer, 'wrong').props.accessibilityState).toEqual({
      disabled: false,
      selected: false,
    });
  });

  it('locks every option after a correct selection', () => {
    const renderer = renderContent(basePayload);

    act(() => {
      findOption(renderer, 'correct').props.onPress();
    });

    expect(findOption(renderer, 'correct').props.accessibilityState).toEqual({
      disabled: true,
      selected: true,
    });
    expect(findOption(renderer, 'correct').props.accessibilityLabel).toContain(
      '回答正确'
    );
    expect(findOption(renderer, 'wrong').props.accessibilityState).toEqual({
      disabled: true,
      selected: false,
    });
    expect(findNodesWithText(renderer, 'adv.')).toHaveLength(0);
    expect(findNodesWithText(renderer, '在这个句子里，barely 表示勉强赶上，强调差一点没做到。')).toHaveLength(0);
  });

  it('marks only the wrong selected option and keeps choices enabled after a wrong selection', () => {
    const renderer = renderContent(basePayload);

    act(() => {
      findOption(renderer, 'wrong').props.onPress();
    });

    expect(findOption(renderer, 'wrong').props.accessibilityState).toEqual({
      disabled: false,
      selected: true,
    });
    expect(findOption(renderer, 'wrong').props.accessibilityLabel).toContain(
      '回答错误'
    );
    expect(findOption(renderer, 'correct').props.accessibilityState).toEqual({
      disabled: false,
      selected: false,
    });
    expect(findOption(renderer, 'correct').props.accessibilityLabel).not.toContain(
      '正确答案'
    );
  });

  it('allows retrying after wrong selections until the correct option locks the dialog', () => {
    const renderer = renderContent(basePayload);

    act(() => {
      findOption(renderer, 'wrong').props.onPress();
    });
    act(() => {
      findOption(renderer, 'correct').props.onPress();
    });

    expect(findOption(renderer, 'wrong').props.accessibilityState).toEqual({
      disabled: true,
      selected: false,
    });
    expect(findOption(renderer, 'correct').props.accessibilityState).toEqual({
      disabled: true,
      selected: true,
    });
    expect(findOption(renderer, 'correct').props.accessibilityLabel).toContain(
      '回答正确'
    );
  });

  it('shows answer detail only after a wrong attempt is followed by the correct option', () => {
    const renderer = renderContent(basePayload);

    act(() => {
      findOption(renderer, 'wrong').props.onPress();
    });
    expect(findNodesWithText(renderer, 'adv.')).toHaveLength(0);

    act(() => {
      findOption(renderer, 'correct').props.onPress();
    });

    expect(findNodesWithText(renderer, 'barely')).toHaveLength(2);
    expect(findNodesWithText(renderer, 'adv.')).toHaveLength(1);
    expect(findNodesWithText(renderer, '几乎不 / 勉强')).toHaveLength(2);
    expect(findNodesWithText(renderer, '在这个句子里，barely 表示勉强赶上，强调差一点没做到。')).toHaveLength(1);
  });
});
