import { memo, useCallback, useEffect, useMemo, useState } from 'react';
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
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {
  createExpandableOverlayDescriptionContentKey,
  createExpandableOverlayDescriptionMeasurementKey,
  createExpandableOverlayDescriptionMeasurementTypographyKey,
  fullscreenVideoOverlayTypography,
  getExpandableOverlayDescriptionState,
  normalizeExpandableOverlayDescriptionMeasuredLineText,
  readExpandableOverlayDescriptionMeasurementCache,
  reduceExpandableOverlayDescriptionUiState,
  resolveExpandableOverlayDescriptionExpandedState,
  resolveExpandableOverlayDescriptionLayoutContract,
  resolveExpandableOverlayDescriptionCollapsedViewportHeight,
  resolveExpandableOverlayDescriptionHeights,
  resolveExpandableOverlayDescriptionMeasurementSnapshot,
  resolveExpandableOverlayDescriptionRenderMode,
  writeExpandableOverlayDescriptionMeasurementCache,
  type ExpandableOverlayDescriptionLayoutContract,
  type ExpandableOverlayDescriptionMeasurementCache,
  type ExpandableOverlayDescriptionMeasurement,
  type ExpandableOverlayDescriptionMeasuredLine,
  type ExpandableOverlayDescriptionUiState,
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
  collapsedViewportHeight: number;
  descriptionContainerHeight: number;
  handleCollapsePress: (event: GestureResponderEvent) => void;
  handleDescriptionTextLayout: (event: NativeSyntheticEvent<TextLayoutEventData>) => void;
  handleExpandPress: (event: GestureResponderEvent) => void;
  isExpandable: boolean;
  isExpanded: boolean;
  layoutContract: ExpandableOverlayDescriptionLayoutContract;
  mode: ReturnType<typeof resolveExpandableOverlayDescriptionRenderMode>;
};

type UseExpandableOverlayDescriptionStateArgs = {
  description: string;
  isActive: boolean;
  maxTextWidth: number;
  measurementCache: ExpandableOverlayDescriptionMeasurementCache;
  stateOwnerKey: string;
};

export function useExpandableOverlayDescriptionState({
  description,
  isActive,
  maxTextWidth,
  measurementCache,
  stateOwnerKey,
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
  const contentKey = useMemo(
    () =>
      createExpandableOverlayDescriptionContentKey({
        measurementKey,
        stateOwnerKey,
      }),
    [measurementKey, stateOwnerKey]
  );
  const [measurement, setMeasurement] = useState<ExpandableOverlayDescriptionMeasurement>({
    key: '',
    lines: [],
  });
  const [uiState, setUiState] = useState<ExpandableOverlayDescriptionUiState>({
    expandedContentKey: null,
  });

  const measurementSnapshot = useMemo(() => {
    const cachedLines = readExpandableOverlayDescriptionMeasurementCache(
      measurementCache,
      measurementKey
    );

    if (cachedLines) {
      return {
        isMeasurementReady: true,
        lines: cachedLines,
      };
    }

    return resolveExpandableOverlayDescriptionMeasurementSnapshot({
      currentMeasurementKey: measurementKey,
      measurement,
    });
  }, [measurement, measurementCache, measurementKey]);
  const measuredLines = measurementSnapshot.lines;
  const descriptionState = useMemo(
    () => getExpandableOverlayDescriptionState(measuredLines),
    [measuredLines]
  );
  const { collapsedHeight, expandedHeight } = useMemo(
    () => resolveExpandableOverlayDescriptionHeights(measuredLines.length),
    [measuredLines.length]
  );
  const collapsedViewportHeight = useMemo(
    () => resolveExpandableOverlayDescriptionCollapsedViewportHeight(),
    []
  );
  const isExpandable =
    measurementSnapshot.isMeasurementReady && descriptionState.isExpandable;
  const isExpanded = useMemo(
    () =>
      resolveExpandableOverlayDescriptionExpandedState({
        contentKey,
        expandedContentKey: uiState.expandedContentKey,
        isActive,
        isExpandable,
      }),
    [contentKey, isActive, isExpandable, uiState.expandedContentKey]
  );
  const mode = useMemo(
    () =>
      resolveExpandableOverlayDescriptionRenderMode({
        isExpanded,
        isMeasurementReady: measurementSnapshot.isMeasurementReady,
        lineCount: measuredLines.length,
      }),
    [isExpanded, measuredLines.length, measurementSnapshot.isMeasurementReady]
  );
  const layoutContract = useMemo(
    () =>
      resolveExpandableOverlayDescriptionLayoutContract({
        actionGap: descriptionActionGap,
        actionLaneHeight: descriptionActionLaneHeight,
        isExpandable,
        isExpanded,
      }),
    [isExpandable, isExpanded]
  );

  useEffect(() => {
    if (
      uiState.expandedContentKey === null ||
      (uiState.expandedContentKey === contentKey && isActive && isExpandable)
    ) {
      return;
    }

    setUiState((previousState) =>
      previousState.expandedContentKey === null
        ? previousState
        : reduceExpandableOverlayDescriptionUiState(previousState, {
            type: 'content-invalidated',
          })
    );
  }, [contentKey, isActive, isExpandable, uiState.expandedContentKey]);

  useEffect(() => {
    if (measurementSnapshot.isMeasurementReady) {
      return;
    }

    setUiState((previousState) =>
      previousState.expandedContentKey === null
        ? previousState
        : reduceExpandableOverlayDescriptionUiState(previousState, {
            type: 'content-invalidated',
          })
    );
  }, [measurementSnapshot.isMeasurementReady]);

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
    setUiState((previousState) =>
      reduceExpandableOverlayDescriptionUiState(previousState, {
        contentKey,
        type: 'expand-pressed',
      })
    );
  }, [contentKey]);

  const handleCollapsePress = useCallback((event: GestureResponderEvent) => {
    event.stopPropagation?.();
    setUiState((previousState) =>
      reduceExpandableOverlayDescriptionUiState(previousState, {
        type: 'collapse-pressed',
      })
    );
  }, []);

  return {
    collapsedViewportHeight,
    descriptionContainerHeight: mode === 'expanded' ? expandedHeight : collapsedHeight,
    handleCollapsePress,
    handleDescriptionTextLayout,
    handleExpandPress,
    isExpandable,
    isExpanded,
    layoutContract,
    mode,
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
    collapsedViewportHeight,
    descriptionContainerHeight,
    handleDescriptionTextLayout,
    isExpandable,
    mode,
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
    | 'isExpanded'
    | 'layoutContract'
  >;
};

function ExpandableOverlayDescriptionActionComponent({
  bottom,
  left,
  state,
}: ExpandableOverlayDescriptionActionProps) {
  const { handleCollapsePress, handleExpandPress, isExpanded, layoutContract } = state;
  const expandLabelOpacity = useSharedValue(isExpanded ? 0 : 1);

  useEffect(() => {
    expandLabelOpacity.value = withTiming(isExpanded ? 0 : 1, {
      duration: actionLabelFadeDurationMs,
    });
  }, [expandLabelOpacity, isExpanded]);

  const expandLabelAnimatedStyle = useAnimatedStyle(() => ({
    opacity: expandLabelOpacity.value,
  }));

  const collapseLabelAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - expandLabelOpacity.value,
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
