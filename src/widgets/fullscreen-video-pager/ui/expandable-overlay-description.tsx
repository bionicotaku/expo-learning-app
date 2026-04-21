import { memo, useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  Text,
  View,
  type GestureResponderEvent,
  type NativeSyntheticEvent,
  type TextLayoutEventData,
} from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import {
  createExpandableOverlayDescriptionMeasurementKey,
  createExpandableOverlayDescriptionMeasurementTypographyKey,
  normalizeExpandableOverlayDescriptionMeasuredLineText,
  peekExpandableOverlayDescriptionMeasurementCache,
  resolveExpandableOverlayDescriptionViewState,
  writeExpandableOverlayDescriptionMeasurementCache,
  type ExpandableOverlayDescriptionMeasurement,
  type ExpandableOverlayDescriptionMeasurementCache,
  type ExpandableOverlayDescriptionMeasuredLine,
  type ExpandableOverlayDescriptionViewState,
} from '../model/expandable-overlay-description';
import {
  fullscreenVideoOverlayTheme,
  fullscreenVideoOverlayDescriptionMeasurementTypography,
} from '../model/fullscreen-video-overlay-theme';

const expandLabel = '展开';
const collapseLabel = '收起';
const actionHitSlop = 8;
const actionLabelFadeDurationMs = 80;
const descriptionMeasurementTypographyKey =
  createExpandableOverlayDescriptionMeasurementTypographyKey(
    fullscreenVideoOverlayDescriptionMeasurementTypography
  );

const descriptionTextStyle = {
  fontSize: fullscreenVideoOverlayTheme.descriptionText.fontSize,
  lineHeight: fullscreenVideoOverlayTheme.descriptionText.lineHeight,
  color: 'rgba(251,247,238,0.9)',
  textShadowColor: 'rgba(17,13,10,0.24)',
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 3,
} as const;

const descriptionActionTextStyle = {
  fontSize: fullscreenVideoOverlayTheme.descriptionActionText.fontSize,
  lineHeight: fullscreenVideoOverlayTheme.descriptionActionText.lineHeight,
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

export type ExpandableOverlayDescriptionState = {
  handleCollapsePress: (event: GestureResponderEvent) => void;
  handleDescriptionTextLayout: (event: NativeSyntheticEvent<TextLayoutEventData>) => void;
  handleExpandPress: (event: GestureResponderEvent) => void;
  measurementKey: string;
  viewState: ExpandableOverlayDescriptionViewState;
};

type UseExpandableOverlayDescriptionStateArgs = {
  activeVisitToken: number | null;
  description: string;
  maxTextWidth: number;
  measurementCache: ExpandableOverlayDescriptionMeasurementCache;
};

function isValidMeasuredLines({
  isDescriptionEmpty,
  lines,
}: {
  isDescriptionEmpty: boolean;
  lines: readonly ExpandableOverlayDescriptionMeasuredLine[];
}) {
  return isDescriptionEmpty || lines.length > 0;
}

export function useExpandableOverlayDescriptionState({
  activeVisitToken,
  description,
  maxTextWidth,
  measurementCache,
}: UseExpandableOverlayDescriptionStateArgs): ExpandableOverlayDescriptionState {
  const isDescriptionEmpty = description.trim().length === 0;
  const measurementKey = useMemo(
    () =>
      createExpandableOverlayDescriptionMeasurementKey({
        description,
        maxTextWidth,
        typographyKey: descriptionMeasurementTypographyKey,
      }),
    [description, maxTextWidth]
  );
  const currentExpansionKey = useMemo(
    () =>
      activeVisitToken === null ? null : `${activeVisitToken}:${measurementKey}`,
    [activeVisitToken, measurementKey]
  );
  const [measurement, setMeasurement] = useState<ExpandableOverlayDescriptionMeasurement>({
    key: '',
    lines: [],
  });
  const [expandedExpansionKey, setExpandedExpansionKey] = useState<string | null>(null);

  const cachedMeasuredLines = useMemo(() => {
    const nextCachedLines = peekExpandableOverlayDescriptionMeasurementCache(
      measurementCache,
      measurementKey
    );

    if (!nextCachedLines) {
      return null;
    }

    return isValidMeasuredLines({
      isDescriptionEmpty,
      lines: nextCachedLines,
    })
      ? nextCachedLines
      : null;
  }, [isDescriptionEmpty, measurementCache, measurementKey]);
  const localMeasuredLines = useMemo(() => {
    if (measurement.key !== measurementKey) {
      return null;
    }

    return isValidMeasuredLines({
      isDescriptionEmpty,
      lines: measurement.lines,
    })
      ? measurement.lines
      : null;
  }, [isDescriptionEmpty, measurement, measurementKey]);
  const measuredLines = useMemo(() => {
    if (isDescriptionEmpty) {
      return [] as readonly ExpandableOverlayDescriptionMeasuredLine[];
    }

    return cachedMeasuredLines ?? localMeasuredLines ?? [];
  }, [cachedMeasuredLines, isDescriptionEmpty, localMeasuredLines]);
  const hasValidMeasurement = isDescriptionEmpty || cachedMeasuredLines !== null || localMeasuredLines !== null;
  const viewState = useMemo(
    () =>
      resolveExpandableOverlayDescriptionViewState({
        activeVisitToken,
        descriptionLineHeight:
          fullscreenVideoOverlayDescriptionMeasurementTypography.descriptionLineHeight,
        hasValidMeasurement,
        expandedExpansionKey,
        isDescriptionEmpty,
        lineCount: measuredLines.length,
        measurementKey,
      }),
    [
      activeVisitToken,
      expandedExpansionKey,
      hasValidMeasurement,
      isDescriptionEmpty,
      measuredLines.length,
      measurementKey,
    ]
  );

  const handleDescriptionTextLayout = useCallback(
    (event: NativeSyntheticEvent<TextLayoutEventData>) => {
      const nextLines = event.nativeEvent.lines.map((line) => ({
        text: normalizeExpandableOverlayDescriptionMeasuredLineText(line.text),
      }));
      const shouldAcceptMeasurement = isValidMeasuredLines({
        isDescriptionEmpty,
        lines: nextLines,
      });

      if (!shouldAcceptMeasurement) {
        return;
      }

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
    [isDescriptionEmpty, measurementCache, measurementKey]
  );

  const handleExpandPress = useCallback(
    (event: GestureResponderEvent) => {
      event.stopPropagation?.();
      if (currentExpansionKey === null) {
        return;
      }

      setExpandedExpansionKey(currentExpansionKey);
    },
    [currentExpansionKey]
  );

  const handleCollapsePress = useCallback((event: GestureResponderEvent) => {
    event.stopPropagation?.();
    setExpandedExpansionKey(null);
  }, []);

  return {
    handleCollapsePress,
    handleDescriptionTextLayout,
    handleExpandPress,
    measurementKey,
    viewState,
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
    measurementKey,
    viewState: {
      collapsedViewportHeight,
      descriptionContainerHeight,
      mode,
    },
  } = state;
  const descriptionViewportHeight = descriptionContainerHeight;
  const canToggle = mode === 'collapsed' || mode === 'expanded';
  const needsMeasurement = mode === 'measuring';

  return (
    <View
      pointerEvents="box-none"
      style={{
        width: maxTextWidth,
        height: descriptionViewportHeight,
        overflow: mode === 'collapsed' || mode === 'expanded' ? 'hidden' : 'visible',
      }}
    >
      {needsMeasurement ? (
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
            key={measurementKey}
            allowFontScaling={false}
            selectable={false}
            onTextLayout={handleDescriptionTextLayout}
            style={descriptionTextStyle}
          >
            {description}
          </Text>
        </View>
      ) : null}

      {mode === 'static' ? (
        description.trim().length === 0 ? null : (
          <Text
            allowFontScaling={false}
            selectable={false}
            style={[descriptionTextStyle, { width: maxTextWidth }]}
          >
            {description}
          </Text>
        )
      ) : mode === 'measuring' ? (
        <View style={{ width: maxTextWidth, height: collapsedViewportHeight }} />
      ) : canToggle ? (
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
    'handleCollapsePress' | 'handleExpandPress' | 'viewState'
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
    viewState: { actionPlacement, mode },
  } = state;
  const isExpanded = mode === 'expanded';

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

  if (actionPlacement === 'hidden') {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left,
        bottom,
        width: fullscreenVideoOverlayTheme.descriptionActionReserveWidth,
        height: fullscreenVideoOverlayTheme.descriptionActionLaneHeight,
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
            width: fullscreenVideoOverlayTheme.descriptionActionReserveWidth,
            height: fullscreenVideoOverlayTheme.descriptionActionLaneHeight,
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
