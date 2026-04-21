import { describe, expect, it, vi } from 'vitest';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Pressable, Text, View } from 'react-native';

import {
  createExpandableOverlayDescriptionMeasurementKey,
  createExpandableOverlayDescriptionMeasurementTypographyKey,
  createExpandableOverlayDescriptionMeasurementCache,
  fullscreenVideoOverlayTypography,
  writeExpandableOverlayDescriptionMeasurementCache,
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
  onRenderSnapshot?: (snapshot: {
    isExpanded: boolean;
    mode: string;
    placement: string;
    stateOwnerKey: string;
  }) => void;
  stateOwnerKey: string;
};

function DescriptionStateHarness({
  description,
  isActive,
  maxTextWidth = 279,
  measurementCache,
  onRenderSnapshot,
  stateOwnerKey,
}: DescriptionStateHarnessProps) {
  const state = useExpandableOverlayDescriptionState({
    description,
    isActive,
    maxTextWidth,
    measurementCache,
    stateOwnerKey,
  });
  onRenderSnapshot?.({
    isExpanded: state.isExpanded,
    mode: state.mode,
    placement: state.layoutContract.actionPlacement,
    stateOwnerKey,
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
  it('collapses immediately when switching to a different warm-cache content key', () => {
    const measurementCache = createExpandableOverlayDescriptionMeasurementCache();
    const typographyKey = createExpandableOverlayDescriptionMeasurementTypographyKey(
      fullscreenVideoOverlayTypography
    );
    const renderSnapshots: {
      isExpanded: boolean;
      mode: string;
      placement: string;
      stateOwnerKey: string;
    }[] = [];
    let renderer: TestRenderer.ReactTestRenderer;

    writeExpandableOverlayDescriptionMeasurementCache({
      cache: measurementCache,
      lines: [{ text: 'line 1' }, { text: 'line 2' }, { text: 'line 3' }],
      measurementKey: createExpandableOverlayDescriptionMeasurementKey({
        description: 'description b',
        maxTextWidth: 279,
        typographyKey,
      }),
    });

    act(() => {
      renderer = TestRenderer.create(
        <DescriptionStateHarness
          description="description a"
          isActive
          measurementCache={measurementCache}
          onRenderSnapshot={(snapshot) => {
            renderSnapshots.push(snapshot);
          }}
          stateOwnerKey="video-a"
        />
      );
    });

    act(() => {
      renderer!.root.findByProps({ testID: 'measure' }).props.onTextLayout({
        nativeEvent: {
          lines: [{ text: 'line 1' }, { text: 'line 2' }, { text: 'line 3' }],
        },
      });
    });

    act(() => {
      renderer!.root.findByProps({ testID: 'expand' }).props.onPress({
        stopPropagation: vi.fn(),
      });
    });

    expect(readTestValue(renderer!, 'mode')).toBe('expanded');
    expect(readTestValue(renderer!, 'placement')).toBe('footer');

    const snapshotCountBeforeSwitch = renderSnapshots.length;

    act(() => {
      renderer!.update(
        <DescriptionStateHarness
          description="description b"
          isActive
          measurementCache={measurementCache}
          onRenderSnapshot={(snapshot) => {
            renderSnapshots.push(snapshot);
          }}
          stateOwnerKey="video-b"
        />
      );
    });

    const switchSnapshots = renderSnapshots.slice(snapshotCountBeforeSwitch);

    expect(switchSnapshots[0]).toMatchObject({
      isExpanded: false,
      mode: 'collapsed',
      placement: 'inline',
      stateOwnerKey: 'video-b',
    });
    expect(readTestValue(renderer!, 'expanded')).toBe('false');
    expect(readTestValue(renderer!, 'mode')).toBe('collapsed');
    expect(readTestValue(renderer!, 'placement')).toBe('inline');
  });

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
          stateOwnerKey="video-a"
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
          stateOwnerKey="video-a"
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
          stateOwnerKey="video-a"
        />
      );
    });

    expect(readTestValue(renderer!, 'mode')).toBe('collapsed');
    expect(readTestValue(renderer!, 'expandable')).toBe('true');
    expect(readTestValue(renderer!, 'expanded')).toBe('false');
    expect(readTestValue(renderer!, 'placement')).toBe('inline');
  });
});
