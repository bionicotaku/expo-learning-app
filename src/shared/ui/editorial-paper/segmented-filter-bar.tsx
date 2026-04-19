import { useEffect, useMemo, useState } from 'react';
import { Pressable, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  interpolateColor,
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';

import { InsetSurface } from './inset-surface';
import type { SegmentedFilterBarProps } from './types';
import { resolveEditorialPaperTextColor } from './utils';
import {
  resolveSegmentedDragProgress,
  resolveSegmentedSnapIndex,
  resolveSegmentedSliderFill,
  resolveSegmentedSliderMetrics,
  SEGMENTED_FILTER_BAR_GAP,
  SEGMENTED_FILTER_BAR_MIN_HEIGHT,
  SEGMENTED_FILTER_BAR_PADDING,
  SEGMENTED_FILTER_BAR_SETTLE_SPRING,
} from './segmented-filter-bar-design';

type SegmentedSliderFillLayerProps = {
  index: number;
  progress: SharedValue<number>;
  baseColor: string;
  gradient: string;
};

function SegmentedSliderFillLayer({
  index,
  progress,
  baseColor,
  gradient,
}: SegmentedSliderFillLayerProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const distance = Math.abs(progress.value - index);

    return {
      opacity: Math.max(0, 1 - distance),
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          inset: 0,
          backgroundColor: baseColor,
          experimental_backgroundImage: gradient,
        },
        animatedStyle,
      ]}
    />
  );
}

type SegmentedFilterBarLabelProps = {
  index: number;
  label: string;
  disabled?: boolean;
  progress: SharedValue<number>;
  selectedTextColor: string;
  inactiveTextColor: string;
};

function SegmentedFilterBarLabel({
  index,
  label,
  disabled = false,
  progress,
  selectedTextColor,
  inactiveTextColor,
}: SegmentedFilterBarLabelProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      progress.value,
      [index - 1, index, index + 1],
      [inactiveTextColor, selectedTextColor, inactiveTextColor]
    ),
  }));

  return (
    <Animated.Text
      style={[
        {
          fontSize: 12,
          lineHeight: 16,
          fontWeight: '700',
          letterSpacing: 0.2,
          opacity: disabled ? 0.45 : 1,
        },
        animatedStyle,
      ]}
    >
      {label}
    </Animated.Text>
  );
}

export function SegmentedFilterBar<T extends string | number>({
  items,
  value,
  onChange,
  tone = 'softActionPeach',
  selectedTextColor,
  inactiveTextColor,
  style,
}: SegmentedFilterBarProps<T>) {
  const { tokens } = useEditorialPaperTheme();
  const [containerWidth, setContainerWidth] = useState(0);
  const activeIndex = useMemo(
    () => Math.max(0, items.findIndex((item) => item.value === value)),
    [items, value]
  );
  const progress = useSharedValue(activeIndex);
  const dragStartProgress = useSharedValue(activeIndex);

  useEffect(() => {
    progress.value = withSpring(activeIndex, SEGMENTED_FILTER_BAR_SETTLE_SPRING);
    dragStartProgress.value = activeIndex;
  }, [activeIndex, dragStartProgress, progress]);

  const sliderMetrics = useMemo(
    () =>
      resolveSegmentedSliderMetrics({
        containerWidth,
        itemCount: items.length,
        activeIndex,
      }),
    [activeIndex, containerWidth, items.length]
  );
  const fills = useMemo(
    () => items.map((item) => resolveSegmentedSliderFill(tokens, item.tone ?? tone)),
    [items, tokens, tone]
  );
  const resolvedSelectedTextColor =
    selectedTextColor ?? resolveEditorialPaperTextColor(tokens, 'ink');
  const resolvedInactiveTextColor =
    inactiveTextColor ?? resolveEditorialPaperTextColor(tokens, 'inkSoft');

  const sliderAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX:
          progress.value *
          (sliderMetrics.segmentWidth + SEGMENTED_FILTER_BAR_GAP),
      },
    ],
  }));

  function handleLayout(event: LayoutChangeEvent) {
    setContainerWidth(event.nativeEvent.layout.width);
  }

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(sliderMetrics.segmentWidth > 0 && items.length > 1)
        .activeOffsetX([-6, 6])
        .failOffsetY([-12, 12])
        .onBegin(() => {
          cancelAnimation(progress);
          dragStartProgress.value = progress.value;
        })
        .onUpdate((event) => {
          progress.value = resolveSegmentedDragProgress({
            startProgress: dragStartProgress.value,
            translationX: event.translationX,
            segmentWidth: sliderMetrics.segmentWidth,
            itemCount: items.length,
          });
        })
        .onEnd((event) => {
          const nextIndex = resolveSegmentedSnapIndex({
            progress: progress.value,
            itemCount: items.length,
            velocityX: event.velocityX,
          });
          const nextItem = items[nextIndex];
          const resolvedIndex =
            nextItem && !nextItem.disabled ? nextIndex : activeIndex;

          dragStartProgress.value = resolvedIndex;
          progress.value = withSpring(
            resolvedIndex,
            SEGMENTED_FILTER_BAR_SETTLE_SPRING,
            (finished) => {
              if (
                finished &&
                resolvedIndex !== activeIndex &&
                nextItem &&
                !nextItem.disabled
              ) {
                runOnJS(onChange)(nextItem.value);
              }
            }
          );
        })
        .onFinalize(() => {
          dragStartProgress.value = progress.value;
        }),
    [
      activeIndex,
      dragStartProgress,
      items,
      onChange,
      progress,
      sliderMetrics.segmentWidth,
    ]
  );

  return (
    <GestureDetector gesture={gesture}>
      <InsetSurface
        radius="pill"
        style={[
          {
            padding: SEGMENTED_FILTER_BAR_PADDING,
          },
          style,
        ]}
      >
        <View
          onLayout={handleLayout}
          style={{
            position: 'relative',
            flexDirection: 'row',
            gap: SEGMENTED_FILTER_BAR_GAP,
          }}
        >
          {sliderMetrics.segmentWidth > 0 ? (
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: sliderMetrics.segmentWidth,
                  minHeight: SEGMENTED_FILTER_BAR_MIN_HEIGHT,
                  borderRadius: tokens.radius.pill,
                  borderCurve: 'continuous',
                  overflow: 'hidden',
                  boxShadow:
                    '6px 6px 12px rgba(215, 204, 187, 0.62), -4px -4px 10px rgba(255, 255, 255, 0.42)',
                },
                sliderAnimatedStyle,
              ]}
            >
              {fills.map((fill, index) => (
                <SegmentedSliderFillLayer
                  key={`${String(items[index]?.value ?? index)}-fill`}
                  index={index}
                  progress={progress}
                  baseColor={fill.baseColor}
                  gradient={fill.gradient}
                />
              ))}
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: tokens.radius.pill,
                  borderCurve: 'continuous',
                  backgroundColor: 'rgba(251, 247, 238, 0.12)',
                }}
              />
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: tokens.radius.pill,
                  borderCurve: 'continuous',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.14)',
                  boxShadow:
                    'inset 1px 1px 2px rgba(255,255,255,0.09), inset -1px -1px 2px rgba(146, 116, 84, 0.08)',
                }}
              />
            </Animated.View>
          ) : null}
          {items.map((item, itemIndex) => {
            return (
              <Pressable
                key={String(item.value)}
                accessibilityRole="button"
                disabled={item.disabled}
                onPress={() => {
                  if (!item.disabled) {
                    onChange(item.value);
                  }
                }}
                style={{
                  flex: 1,
                  minHeight: SEGMENTED_FILTER_BAR_MIN_HEIGHT,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: tokens.spacing.md,
                }}
              >
                <SegmentedFilterBarLabel
                  disabled={item.disabled}
                  inactiveTextColor={resolvedInactiveTextColor}
                  index={itemIndex}
                  label={item.label}
                  progress={progress}
                  selectedTextColor={resolvedSelectedTextColor}
                />
              </Pressable>
            );
          })}
        </View>
      </InsetSurface>
    </GestureDetector>
  );
}
