import { memo, useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  Text,
  View,
  type GestureResponderEvent,
  type NativeSyntheticEvent,
  type TextLayoutEventData,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import {
  createExpandableOverlayDescriptionMeasurementKey,
  createExpandableOverlayDescriptionMeasurementTypographyKey,
  fullscreenVideoOverlayTypography,
  normalizeExpandableOverlayDescriptionMeasuredLineText,
  peekExpandableOverlayDescriptionMeasurementCache,
  resolveExpandableOverlayDescriptionViewModel,
  writeExpandableOverlayDescriptionMeasurementCache,
  type ExpandableOverlayDescriptionMeasurementCache,
  type ExpandableOverlayDescriptionMeasurement,
  type ExpandableOverlayDescriptionMeasuredLine,
  type ExpandableOverlayDescriptionViewModel,
} from '../model/expandable-overlay-description';

export const descriptionActionReserveWidth = 34;
export const descriptionActionLaneHeight =
  fullscreenVideoOverlayTypography.actionLaneHeight;
export const descriptionActionGap = 4;

const expandLabel = '展开';
const collapseLabel = '收起';
const actionHitSlop = 8;
const actionLabelFadeDurationMs = 80;
const descriptionMeasurementTypographyKey =
  createExpandableOverlayDescriptionMeasurementTypographyKey(
    fullscreenVideoOverlayTypography
  );

const descriptionTextStyle = {
  fontSize: fullscreenVideoOverlayTypography.descriptionFontSize,
  lineHeight: fullscreenVideoOverlayTypography.descriptionLineHeight,
  color: 'rgba(251,247,238,0.9)',
  textShadowColor: 'rgba(17,13,10,0.24)',
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 3,
} as const;

const descriptionActionTextStyle = {
  fontSize: fullscreenVideoOverlayTypography.actionFontSize,
  lineHeight: fullscreenVideoOverlayTypography.actionLineHeight,
  color: 'rgba(251,247,238,0.98)',
  fontWeight: '700' as const,
  textShadowColor: 'rgba(17,13,10,0.24)',
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 3,
} as const;

function areMeasuredLinesEqual(
  previousLines: readonly ExpandableOverlayDescriptionMeasuredLine[],
  nextLines: readonly ExpandableOverlayDescriptionMeasuredLine[]
) {
  return (
    previousLines.length === nextLines.length &&
    previousLines.every((line, index) => line.text === nextLines[index]?.text)
  );
}

type ExpandableOverlayDescriptionState = {
  handleCollapsePress: (event: GestureResponderEvent) => void;
  handleDescriptionTextLayout: (event: NativeSyntheticEvent<TextLayoutEventData>) => void;
  handleExpandPress: (event: GestureResponderEvent) => void;
  viewModel: ExpandableOverlayDescriptionViewModel;
};

type UseExpandableOverlayDescriptionStateArgs = {
  activeVisitToken: number | null;
  description: string;
  maxTextWidth: number;
  measurementCache: ExpandableOverlayDescriptionMeasurementCache;
};

export function useExpandableOverlayDescriptionState({
  activeVisitToken,
  description,
  maxTextWidth,
  measurementCache,
}: UseExpandableOverlayDescriptionStateArgs): ExpandableOverlayDescriptionState {
  const measurementKey = useMemo(
    () =>
      createExpandableOverlayDescriptionMeasurementKey({
        description,
        maxTextWidth,
        typographyKey: descriptionMeasurementTypographyKey,
      }),
    [description, maxTextWidth]
  );
  const [measurement, setMeasurement] = useState<ExpandableOverlayDescriptionMeasurement>({
    key: '',
    lines: [],
  });
  const [expandedExpansionKey, setExpandedExpansionKey] = useState<string | null>(null);

  const cachedMeasuredLines = useMemo(
    () =>
      peekExpandableOverlayDescriptionMeasurementCache(
        measurementCache,
        measurementKey
      ),
    [measurementCache, measurementKey]
  );
  const measuredLines = useMemo(() => {
    if (cachedMeasuredLines) {
      return cachedMeasuredLines;
    }

    if (measurement.key === measurementKey) {
      return measurement.lines;
    }

    return [] as readonly ExpandableOverlayDescriptionMeasuredLine[];
  }, [cachedMeasuredLines, measurement, measurementKey]);
  const isMeasurementReady =
    cachedMeasuredLines !== undefined || measurement.key === measurementKey;
  const viewModel = useMemo(
    () =>
      resolveExpandableOverlayDescriptionViewModel({
        actionGap: descriptionActionGap,
        actionLaneHeight: descriptionActionLaneHeight,
        activeVisitToken,
        expandedExpansionKey,
        isMeasurementReady,
        lineCount: measuredLines.length,
        measurementKey,
      }),
    [activeVisitToken, expandedExpansionKey, isMeasurementReady, measuredLines.length, measurementKey]
  );

  const handleDescriptionTextLayout = useCallback(
    (event: NativeSyntheticEvent<TextLayoutEventData>) => {
      const nextLines = event.nativeEvent.lines.map((line) => ({
        text: normalizeExpandableOverlayDescriptionMeasuredLineText(line.text),
      }));

      writeExpandableOverlayDescriptionMeasurementCache({
        cache: measurementCache,
        lines: nextLines,
        measurementKey,
      });
      setMeasurement((previousMeasurement) =>
        previousMeasurement.key === measurementKey &&
        areMeasuredLinesEqual(previousMeasurement.lines, nextLines)
          ? previousMeasurement
          : {
              key: measurementKey,
              lines: nextLines,
            }
      );
    },
    [measurementCache, measurementKey]
  );

  const handleExpandPress = useCallback((event: GestureResponderEvent) => {
    event.stopPropagation?.();
    if (viewModel.currentExpansionKey === null) {
      return;
    }

    setExpandedExpansionKey(viewModel.currentExpansionKey);
  }, [viewModel.currentExpansionKey]);

  const handleCollapsePress = useCallback((event: GestureResponderEvent) => {
    event.stopPropagation?.();
    setExpandedExpansionKey(null);
  }, []);

  return {
    handleCollapsePress,
    handleDescriptionTextLayout,
    handleExpandPress,
    viewModel,
  };
}

type ExpandableOverlayDescriptionProps = {
  description: string;
  maxTextWidth: number;
  state: ExpandableOverlayDescriptionState;
};

function ExpandableOverlayDescriptionComponent({
  description,
  maxTextWidth,
  state,
}: ExpandableOverlayDescriptionProps) {
  const {
    handleDescriptionTextLayout,
    viewModel: {
      collapsedViewportHeight,
      descriptionContainerHeight,
      isExpandable,
      mode,
    },
  } = state;
  const descriptionViewportHeight =
    mode === 'measuring' ? collapsedViewportHeight : descriptionContainerHeight;

  return (
    <View
      pointerEvents="box-none"
      style={{
        width: maxTextWidth,
        height: descriptionViewportHeight,
        overflow: mode === 'collapsed' || mode === 'expanded' ? 'hidden' : 'visible',
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: maxTextWidth,
          opacity: 0,
        }}
      >
        <Text
          allowFontScaling={false}
          selectable={false}
          onTextLayout={handleDescriptionTextLayout}
          style={descriptionTextStyle}
        >
          {description}
        </Text>
      </View>

      {mode === 'static' ? (
        <Text
          allowFontScaling={false}
          selectable={false}
          style={[descriptionTextStyle, { width: maxTextWidth }]}
        >
          {description}
        </Text>
      ) : mode === 'measuring' ? (
        <View style={{ width: maxTextWidth, height: collapsedViewportHeight }} />
      ) : isExpandable ? (
        mode === 'expanded' ? (
          <View style={{ width: maxTextWidth }}>
            <Text
              allowFontScaling={false}
              selectable={false}
              style={descriptionTextStyle}
            >
              {description}
            </Text>
          </View>
        ) : (
          <Text
            allowFontScaling={false}
            selectable={false}
            style={[descriptionTextStyle, { width: maxTextWidth }]}
            numberOfLines={mode === 'collapsed' ? 2 : undefined}
            ellipsizeMode={mode === 'collapsed' ? 'tail' : undefined}
          >
            {description}
          </Text>
        )
      ) : (
        <Text
          allowFontScaling={false}
          selectable={false}
          style={[descriptionTextStyle, { width: maxTextWidth }]}
        >
          {description}
        </Text>
      )}
    </View>
  );
}

export const ExpandableOverlayDescription = memo(
  ExpandableOverlayDescriptionComponent
);

type ExpandableOverlayDescriptionActionProps = {
  bottom: number;
  left: number;
  state: Pick<
    ExpandableOverlayDescriptionState,
    | 'handleCollapsePress'
    | 'handleExpandPress'
    | 'viewModel'
  >;
};

function ExpandableOverlayDescriptionActionComponent({
  bottom,
  left,
  state,
}: ExpandableOverlayDescriptionActionProps) {
  const {
    handleCollapsePress,
    handleExpandPress,
    viewModel: { isExpanded, layoutContract },
  } = state;

  const expandLabelAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isExpanded ? 0 : 1, {
      duration: actionLabelFadeDurationMs,
    }),
  }));

  const collapseLabelAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isExpanded ? 1 : 0, {
      duration: actionLabelFadeDurationMs,
    }),
  }));

  if (layoutContract.actionPlacement === 'hidden') {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left,
        bottom,
        width: descriptionActionReserveWidth,
        height: descriptionActionLaneHeight,
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
      }}
    >
      <Pressable
        hitSlop={actionHitSlop}
        onPress={isExpanded ? handleCollapsePress : handleExpandPress}
      >
        <View
          style={{
            position: 'relative',
            width: descriptionActionReserveWidth,
            height: descriptionActionLaneHeight,
          }}
        >
          <Animated.Text
            allowFontScaling={false}
            pointerEvents="none"
            selectable={false}
            style={[
              descriptionActionTextStyle,
              {
                position: 'absolute',
                right: 0,
                bottom: 0,
              },
              expandLabelAnimatedStyle,
            ]}
          >
            {expandLabel}
          </Animated.Text>
          <Animated.Text
            allowFontScaling={false}
            pointerEvents="none"
            selectable={false}
            style={[
              descriptionActionTextStyle,
              {
                position: 'absolute',
                right: 0,
                bottom: 0,
              },
              collapseLabelAnimatedStyle,
            ]}
          >
            {collapseLabel}
          </Animated.Text>
        </View>
      </Pressable>
    </View>
  );
}

export const ExpandableOverlayDescriptionAction = memo(
  ExpandableOverlayDescriptionActionComponent
);
