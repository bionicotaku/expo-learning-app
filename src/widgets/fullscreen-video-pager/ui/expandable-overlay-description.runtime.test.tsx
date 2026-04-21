import { describe, expect, it, vi } from 'vitest';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Pressable, Text, View } from 'react-native';

import {
  createExpandableOverlayDescriptionMeasurementKey,
  createExpandableOverlayDescriptionMeasurementTypographyKey,
  createExpandableOverlayDescriptionMeasurementCache,
  writeExpandableOverlayDescriptionMeasurementCache,
  type ExpandableOverlayDescriptionMeasurementCache,
} from '../model/expandable-overlay-description';
import {
  createFullscreenVideoOverlayDescriptionMeasurementTypography,
  fullscreenVideoOverlayTheme,
} from '../model/fullscreen-video-overlay-theme';
import {
  ExpandableOverlayDescription,
  useExpandableOverlayDescriptionState,
} from './expandable-overlay-description';

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
  activeVisitToken: number | null;
  description: string;
  maxTextWidth?: number;
  measurementCache: ExpandableOverlayDescriptionMeasurementCache;
  onRenderSnapshot?: (snapshot: {
    isExpanded: boolean;
    mode: string;
    placement: string;
    activeVisitToken: number | null;
  }) => void;
};

function DescriptionStateHarness({
  activeVisitToken,
  description,
  maxTextWidth = 279,
  measurementCache,
  onRenderSnapshot,
}: DescriptionStateHarnessProps) {
  const state = useExpandableOverlayDescriptionState({
    activeVisitToken,
    description,
    maxTextWidth,
    measurementCache,
  });
  const isExpanded = state.viewState.mode === 'expanded';
  const canToggle =
    state.viewState.mode === 'collapsed' || state.viewState.mode === 'expanded';
  onRenderSnapshot?.({
    isExpanded,
    mode: state.viewState.mode,
    placement: state.viewState.actionPlacement,
    activeVisitToken,
  });

  return (
    <View>
      <Text testID="mode">{state.viewState.mode}</Text>
      <Text testID="can-toggle">{String(canToggle)}</Text>
      <Text testID="expanded">{String(isExpanded)}</Text>
      <Text testID="placement">{state.viewState.actionPlacement}</Text>
      <Pressable testID="expand" onPress={state.handleExpandPress} />
      <Pressable testID="collapse" onPress={state.handleCollapsePress} />
      <Text testID="measure" onTextLayout={state.handleDescriptionTextLayout}>
        {description}
      </Text>
      <ExpandableOverlayDescription
        description={description}
        maxTextWidth={maxTextWidth}
        state={state}
      />
    </View>
  );
}

function readTestValue(
  renderer: TestRenderer.ReactTestRenderer,
  testID: string
) {
  return renderer.root.findByProps({ testID }).props.children;
}

function countMeasurementListeners(renderer: TestRenderer.ReactTestRenderer) {
  return renderer.root.findAll((node) => typeof node.props.onTextLayout === 'function')
    .length;
}

describe('expandable overlay description runtime', () => {
  it('treats invalid cached empty lines as a cache miss for non-empty descriptions', () => {
    const measurementCache = createExpandableOverlayDescriptionMeasurementCache();
    const typographyKey = createExpandableOverlayDescriptionMeasurementTypographyKey(
      createFullscreenVideoOverlayDescriptionMeasurementTypography(
        fullscreenVideoOverlayTheme.descriptionText
      )
    );
    let renderer: TestRenderer.ReactTestRenderer;

    writeExpandableOverlayDescriptionMeasurementCache({
      cache: measurementCache,
      lines: [],
      measurementKey: createExpandableOverlayDescriptionMeasurementKey({
        description: 'description a',
        maxTextWidth: 279,
        typographyKey,
      }),
    });

    act(() => {
      renderer = TestRenderer.create(
        <DescriptionStateHarness
          activeVisitToken={1}
          description="description a"
          measurementCache={measurementCache}
        />
      );
    });

    expect(readTestValue(renderer!, 'mode')).toBe('measuring');
    expect(readTestValue(renderer!, 'placement')).toBe('hidden');
    expect(readTestValue(renderer!, 'can-toggle')).toBe('false');
  });

  it('ignores empty onTextLayout results for non-empty descriptions', () => {
    const measurementCache = createExpandableOverlayDescriptionMeasurementCache();
    let renderer: TestRenderer.ReactTestRenderer;

    act(() => {
      renderer = TestRenderer.create(
        <DescriptionStateHarness
          activeVisitToken={1}
          description="description a"
          measurementCache={measurementCache}
        />
      );
    });

    act(() => {
      renderer!.root.findByProps({ testID: 'measure' }).props.onTextLayout({
        nativeEvent: {
          lines: [],
        },
      });
    });

    expect(readTestValue(renderer!, 'mode')).toBe('measuring');
    expect(readTestValue(renderer!, 'placement')).toBe('hidden');
    expect(readTestValue(renderer!, 'can-toggle')).toBe('false');
  });

  it('unmounts the hidden measurer after receiving a valid measurement', () => {
    const measurementCache = createExpandableOverlayDescriptionMeasurementCache();
    let renderer: TestRenderer.ReactTestRenderer;

    act(() => {
      renderer = TestRenderer.create(
        <DescriptionStateHarness
          activeVisitToken={1}
          description="description a"
          measurementCache={measurementCache}
        />
      );
    });

    expect(countMeasurementListeners(renderer!)).toBe(4);

    act(() => {
      renderer!.root.findByProps({ testID: 'measure' }).props.onTextLayout({
        nativeEvent: {
          lines: [{ text: 'line 1' }, { text: 'line 2' }, { text: 'line 3' }],
        },
      });
    });

    expect(readTestValue(renderer!, 'mode')).toBe('collapsed');
    expect(countMeasurementListeners(renderer!)).toBe(2);
  });

  it('collapses immediately when switching to a different warm-cache content key', () => {
    const measurementCache = createExpandableOverlayDescriptionMeasurementCache();
    const typographyKey = createExpandableOverlayDescriptionMeasurementTypographyKey(
      createFullscreenVideoOverlayDescriptionMeasurementTypography(
        fullscreenVideoOverlayTheme.descriptionText
      )
    );
    const renderSnapshots: {
      isExpanded: boolean;
      mode: string;
      placement: string;
      activeVisitToken: number | null;
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
          activeVisitToken={1}
          description="description a"
          measurementCache={measurementCache}
          onRenderSnapshot={(snapshot) => {
            renderSnapshots.push(snapshot);
          }}
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
          activeVisitToken={2}
          description="description b"
          measurementCache={measurementCache}
          onRenderSnapshot={(snapshot) => {
            renderSnapshots.push(snapshot);
          }}
        />
      );
    });

    const switchSnapshots = renderSnapshots.slice(snapshotCountBeforeSwitch);

    expect(switchSnapshots[0]).toMatchObject({
      isExpanded: false,
      mode: 'collapsed',
      placement: 'inline',
      activeVisitToken: 2,
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
          activeVisitToken={1}
          description={description}
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
    expect(readTestValue(renderer!, 'can-toggle')).toBe('true');
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
          activeVisitToken={null}
          description={description}
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
          activeVisitToken={2}
          description={description}
          measurementCache={measurementCache}
        />
      );
    });

    expect(readTestValue(renderer!, 'mode')).toBe('collapsed');
    expect(readTestValue(renderer!, 'can-toggle')).toBe('true');
    expect(readTestValue(renderer!, 'expanded')).toBe('false');
    expect(readTestValue(renderer!, 'placement')).toBe('inline');
  });

  it('renders empty descriptions as static hidden zero-height content', () => {
    const measurementCache = createExpandableOverlayDescriptionMeasurementCache();
    let renderer: TestRenderer.ReactTestRenderer;

    act(() => {
      renderer = TestRenderer.create(
        <DescriptionStateHarness
          activeVisitToken={1}
          description="   "
          measurementCache={measurementCache}
        />
      );
    });

    expect(readTestValue(renderer!, 'mode')).toBe('static');
    expect(readTestValue(renderer!, 'placement')).toBe('hidden');
    expect(readTestValue(renderer!, 'can-toggle')).toBe('false');
    expect(countMeasurementListeners(renderer!)).toBe(2);
  });

  it('does not revive expanded state when the same mounted row gets a new active visit token', () => {
    const measurementCache = createExpandableOverlayDescriptionMeasurementCache();
    const description =
      'Compact example of how people soften, dodge, or redirect a tense moment.';
    let renderer: TestRenderer.ReactTestRenderer;

    act(() => {
      renderer = TestRenderer.create(
        <DescriptionStateHarness
          activeVisitToken={1}
          description={description}
          measurementCache={measurementCache}
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

    act(() => {
      renderer!.update(
        <DescriptionStateHarness
          activeVisitToken={null}
          description={description}
          measurementCache={measurementCache}
        />
      );
    });

    expect(readTestValue(renderer!, 'mode')).toBe('collapsed');
    expect(readTestValue(renderer!, 'expanded')).toBe('false');

    act(() => {
      renderer!.update(
        <DescriptionStateHarness
          activeVisitToken={2}
          description={description}
          measurementCache={measurementCache}
        />
      );
    });

    expect(readTestValue(renderer!, 'mode')).toBe('collapsed');
    expect(readTestValue(renderer!, 'expanded')).toBe('false');
    expect(readTestValue(renderer!, 'placement')).toBe('inline');
  });
});
