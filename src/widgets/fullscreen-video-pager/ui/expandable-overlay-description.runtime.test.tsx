import { describe, expect, it, vi } from 'vitest';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Pressable, Text, View } from 'react-native';

import {
  createExpandableOverlayDescriptionMeasurementCache,
  type ExpandableOverlayDescriptionMeasurementCache,
} from '../model/expandable-overlay-description';
import { useExpandableOverlayDescriptionState } from './expandable-overlay-description';

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
    useWindowDimensions: () => ({
      fontScale: 1,
      height: 844,
      scale: 3,
      width: 390,
    }),
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
      Text: createAnimatedComponent('AnimatedText'),
    },
    useAnimatedStyle: (updater: () => Record<string, unknown>) => updater(),
    useSharedValue: <T,>(value: T) => ({ value }),
    withTiming: <T,>(value: T) => value,
  };
});

type DescriptionStateHarnessProps = {
  description: string;
  isActive: boolean;
  maxTextWidth?: number;
  measurementCache: ExpandableOverlayDescriptionMeasurementCache;
};

function DescriptionStateHarness({
  description,
  isActive,
  maxTextWidth = 279,
  measurementCache,
}: DescriptionStateHarnessProps) {
  const state = useExpandableOverlayDescriptionState({
    description,
    isActive,
    maxTextWidth,
    measurementCache,
  });

  return (
    <View>
      <Text testID="mode">{state.mode}</Text>
      <Text testID="expandable">{String(state.isExpandable)}</Text>
      <Text testID="expanded">{String(state.isExpanded)}</Text>
      <Text testID="placement">{state.layoutContract.actionPlacement}</Text>
      <Pressable testID="expand" onPress={state.handleExpandPress} />
      <Pressable testID="collapse" onPress={state.handleCollapsePress} />
      <Text testID="measure" onTextLayout={state.handleDescriptionTextLayout}>
        {description}
      </Text>
    </View>
  );
}

function readTestValue(
  renderer: TestRenderer.ReactTestRenderer,
  testID: string
) {
  return renderer.root.findByProps({ testID }).props.children;
}

describe('expandable overlay description runtime', () => {
  it('reuses pager-scoped measurement cache while resetting expanded state across inactive switches and remounts', () => {
    const measurementCache = createExpandableOverlayDescriptionMeasurementCache();
    const description =
      'Compact example of how people soften, dodge, or redirect a tense moment.';
    let renderer: TestRenderer.ReactTestRenderer;

    act(() => {
      renderer = TestRenderer.create(
        <DescriptionStateHarness
          description={description}
          isActive
          measurementCache={measurementCache}
        />
      );
    });

    expect(readTestValue(renderer!, 'mode')).toBe('measuring');
    expect(readTestValue(renderer!, 'placement')).toBe('hidden');

    act(() => {
      renderer!.root.findByProps({ testID: 'measure' }).props.onTextLayout({
        nativeEvent: {
          lines: [{ text: 'line 1' }, { text: 'line 2' }, { text: 'line 3' }],
        },
      });
    });

    expect(readTestValue(renderer!, 'mode')).toBe('collapsed');
    expect(readTestValue(renderer!, 'expandable')).toBe('true');
    expect(readTestValue(renderer!, 'expanded')).toBe('false');
    expect(readTestValue(renderer!, 'placement')).toBe('inline');

    const expandStopPropagation = vi.fn();
    act(() => {
      renderer!.root.findByProps({ testID: 'expand' }).props.onPress({
        stopPropagation: expandStopPropagation,
      });
    });

    expect(expandStopPropagation).toHaveBeenCalledOnce();
    expect(readTestValue(renderer!, 'mode')).toBe('expanded');
    expect(readTestValue(renderer!, 'expanded')).toBe('true');
    expect(readTestValue(renderer!, 'placement')).toBe('footer');

    act(() => {
      renderer!.update(
        <DescriptionStateHarness
          description={description}
          isActive={false}
          measurementCache={measurementCache}
        />
      );
    });

    expect(readTestValue(renderer!, 'mode')).toBe('collapsed');
    expect(readTestValue(renderer!, 'expanded')).toBe('false');
    expect(readTestValue(renderer!, 'placement')).toBe('inline');

    act(() => {
      renderer!.unmount();
    });

    act(() => {
      renderer = TestRenderer.create(
        <DescriptionStateHarness
          description={description}
          isActive
          measurementCache={measurementCache}
        />
      );
    });

    expect(readTestValue(renderer!, 'mode')).toBe('collapsed');
    expect(readTestValue(renderer!, 'expandable')).toBe('true');
    expect(readTestValue(renderer!, 'expanded')).toBe('false');
    expect(readTestValue(renderer!, 'placement')).toBe('inline');
  });
});
