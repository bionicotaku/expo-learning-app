import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { describe, expect, it, vi } from 'vitest';

import {
  WordDetailDialogContent,
  type WordDetailDialogData,
} from './word-detail-dialog-content';

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

describe('WordDetailDialogContent runtime', () => {
  it('does not render learning feedback buttons by default', () => {
    const renderer = renderContent(basePayload);

    expect(findTextNodes(renderer, '认识')).toHaveLength(0);
    expect(findTextNodes(renderer, '模糊')).toHaveLength(0);
    expect(findTextNodes(renderer, '不认识')).toHaveLength(0);
  });

  it('renders disabled learning feedback buttons when requested', () => {
    const renderer = renderContent({
      ...basePayload,
      showLearningFeedbackActions: true,
    });

    expect(findTextNodes(renderer, '认识')).toHaveLength(1);
    expect(findTextNodes(renderer, '模糊')).toHaveLength(1);
    expect(findTextNodes(renderer, '不认识')).toHaveLength(1);
    expect(
      renderer.root
        .findAllByProps({ accessibilityRole: 'button' })
        .every((node) => node.props.disabled === true)
    ).toBe(true);
  });
});
