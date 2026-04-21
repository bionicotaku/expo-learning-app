import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  Text,
  View,
  useWindowDimensions,
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
  createExpandableOverlayDescriptionMeasurementKey,
  getExpandableOverlayDescriptionState,
  normalizeExpandableOverlayDescriptionMeasuredLineText,
  readExpandableOverlayDescriptionMeasurementCache,
  reduceExpandableOverlayDescriptionUiState,
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
} from '../model/expandable-overlay-description';

export const descriptionActionReserveWidth = 34;
export const descriptionActionLaneHeight = 16;
export const descriptionActionGap = 4;

const expandLabel = '展开';
const collapseLabel = '收起';
const actionHitSlop = 8;
const actionLabelFadeDurationMs = 80;
const descriptionMeasurementTypographyKey = '13.5:16:v1';

const descriptionTextStyle = {
  fontSize: 13.5,
  lineHeight: 16,
  color: 'rgba(251,247,238,0.9)',
  textShadowColor: 'rgba(17,13,10,0.24)',
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 3,
} as const;

const descriptionActionTextStyle = {
  fontSize: 13.5,
  lineHeight: 16,
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
};

export function useExpandableOverlayDescriptionState({
  description,
  isActive,
  maxTextWidth,
  measurementCache,
}: UseExpandableOverlayDescriptionStateArgs): ExpandableOverlayDescriptionState {
  const { fontScale } = useWindowDimensions();
  const measurementKey = useMemo(
    () =>
      createExpandableOverlayDescriptionMeasurementKey({
        description,
        fontScale,
        maxTextWidth,
        typographyKey: descriptionMeasurementTypographyKey,
      }),
    [description, fontScale, maxTextWidth]
  );
  const [measurement, setMeasurement] = useState<ExpandableOverlayDescriptionMeasurement>({
    key: '',
    lines: [],
  });
  const [isExpanded, setIsExpanded] = useState(false);

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
  const mode = useMemo(
    () =>
      resolveExpandableOverlayDescriptionRenderMode({
        isExpanded,
        isMeasurementReady: measurementSnapshot.isMeasurementReady,
        lineCount: measuredLines.length,
      }),
    [isExpanded, measuredLines.length, measurementSnapshot.isMeasurementReady]
  );
  const isExpandable =
    measurementSnapshot.isMeasurementReady && descriptionState.isExpandable;
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
    setIsExpanded((previousState) =>
      reduceExpandableOverlayDescriptionUiState(
        { isExpanded: previousState },
        { type: 'description-changed' }
      ).isExpanded
    );
  }, [description]);

  useEffect(() => {
    if (!isActive) {
      setIsExpanded((previousState) =>
        reduceExpandableOverlayDescriptionUiState(
          { isExpanded: previousState },
          { type: 'became-inactive' }
        ).isExpanded
      );
    }
  }, [isActive]);

  useEffect(() => {
    if (!isExpandable) {
      setIsExpanded((previousState) =>
        reduceExpandableOverlayDescriptionUiState(
          { isExpanded: previousState },
          { type: 'lost-expandability' }
        ).isExpanded
      );
    }
  }, [isExpandable]);

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
    setIsExpanded((previousState) =>
      reduceExpandableOverlayDescriptionUiState(
        { isExpanded: previousState },
        { type: 'expand-pressed' }
      ).isExpanded
    );
  }, []);

  const handleCollapsePress = useCallback((event: GestureResponderEvent) => {
    event.stopPropagation?.();
    setIsExpanded((previousState) =>
      reduceExpandableOverlayDescriptionUiState(
        { isExpanded: previousState },
        { type: 'collapse-pressed' }
      ).isExpanded
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
          selectable={false}
          onTextLayout={handleDescriptionTextLayout}
          style={descriptionTextStyle}
        >
          {description}
        </Text>
      </View>

      {mode === 'static' ? (
        <Text selectable={false} style={[descriptionTextStyle, { width: maxTextWidth }]}>
          {description}
        </Text>
      ) : mode === 'measuring' ? (
        <View style={{ width: maxTextWidth, height: collapsedViewportHeight }} />
      ) : isExpandable ? (
        mode === 'expanded' ? (
          <View style={{ width: maxTextWidth }}>
            <Text selectable={false} style={descriptionTextStyle}>
              {description}
            </Text>
          </View>
        ) : (
          <Text
            selectable={false}
            style={[descriptionTextStyle, { width: maxTextWidth }]}
            numberOfLines={mode === 'collapsed' ? 2 : undefined}
            ellipsizeMode={mode === 'collapsed' ? 'tail' : undefined}
          >
            {description}
          </Text>
        )
      ) : (
        <Text selectable={false} style={[descriptionTextStyle, { width: maxTextWidth }]}>
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
