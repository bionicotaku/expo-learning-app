export type ExpandableOverlayDescriptionMeasuredLine = {
  text: string;
};

export type ExpandableOverlayDescriptionMeasurement = {
  key: string;
  lines: readonly ExpandableOverlayDescriptionMeasuredLine[];
};

export type ExpandableOverlayDescriptionMeasurementCache = {
  entries: Map<string, readonly ExpandableOverlayDescriptionMeasuredLine[]>;
  limit: number;
};

export type ExpandableOverlayDescriptionLayoutContract = {
  actionPlacement: 'hidden' | 'inline' | 'footer';
  contentBottomLift: number;
};

export type ExpandableOverlayDescriptionUiState = {
  isExpanded: boolean;
};

type ExpandableOverlayDescriptionUiEvent =
  | { type: 'became-inactive' }
  | { type: 'collapse-pressed' }
  | { type: 'description-changed' }
  | { type: 'expand-pressed' }
  | { type: 'lost-expandability' };

type ExpandableOverlayDescriptionRenderMode =
  | 'measuring'
  | 'static'
  | 'collapsed'
  | 'expanded';

const collapsedLineCount = 2;
const descriptionLineHeight = 16;
const defaultMeasurementCacheLimit = 120;

export function createExpandableOverlayDescriptionMeasurementKey({
  description,
  fontScale,
  maxTextWidth,
  typographyKey,
}: {
  description: string;
  fontScale: number;
  maxTextWidth: number;
  typographyKey: string;
}) {
  const normalizedWidth = maxTextWidth.toFixed(2);
  const normalizedFontScale = fontScale.toFixed(2);

  return `${typographyKey}:${normalizedFontScale}:${normalizedWidth}:${description}`;
}

export function createExpandableOverlayDescriptionMeasurementCache(
  limit = defaultMeasurementCacheLimit
): ExpandableOverlayDescriptionMeasurementCache {
  return {
    entries: new Map(),
    limit,
  };
}

export function readExpandableOverlayDescriptionMeasurementCache(
  cache: ExpandableOverlayDescriptionMeasurementCache,
  measurementKey: string
) {
  return cache.entries.get(measurementKey);
}

export function writeExpandableOverlayDescriptionMeasurementCache({
  cache,
  lines,
  measurementKey,
}: {
  cache: ExpandableOverlayDescriptionMeasurementCache;
  lines: readonly ExpandableOverlayDescriptionMeasuredLine[];
  measurementKey: string;
}) {
  if (cache.entries.has(measurementKey)) {
    cache.entries.delete(measurementKey);
  }

  cache.entries.set(measurementKey, lines);

  while (cache.entries.size > cache.limit) {
    const oldestKey = cache.entries.keys().next().value;

    if (!oldestKey) {
      return;
    }

    cache.entries.delete(oldestKey);
  }
}

export function normalizeExpandableOverlayDescriptionMeasuredLineText(text: string) {
  return text.replace(/\s+$/u, '');
}

export function resolveExpandableOverlayDescriptionMeasurementSnapshot({
  currentMeasurementKey,
  measurement,
}: {
  currentMeasurementKey: string;
  measurement: ExpandableOverlayDescriptionMeasurement;
}) {
  if (measurement.key !== currentMeasurementKey) {
    return {
      isMeasurementReady: false,
      lines: [] as readonly ExpandableOverlayDescriptionMeasuredLine[],
    };
  }

  return {
    isMeasurementReady: true,
    lines: measurement.lines,
  };
}

export function resolveExpandableOverlayDescriptionRenderMode({
  isExpanded,
  isMeasurementReady,
  lineCount,
}: {
  isExpanded: boolean;
  isMeasurementReady: boolean;
  lineCount: number;
}): ExpandableOverlayDescriptionRenderMode {
  if (!isMeasurementReady) {
    return 'measuring';
  }

  if (lineCount <= collapsedLineCount) {
    return 'static';
  }

  return isExpanded ? 'expanded' : 'collapsed';
}

export function getExpandableOverlayDescriptionState(
  lines: readonly ExpandableOverlayDescriptionMeasuredLine[]
) {
  return {
    isExpandable: lines.length > collapsedLineCount,
    visibleLineCount: Math.min(lines.length, collapsedLineCount),
  };
}

export function resolveExpandableOverlayDescriptionLayoutContract({
  actionGap,
  actionLaneHeight,
  isExpandable,
  isExpanded,
}: {
  actionGap: number;
  actionLaneHeight: number;
  isExpandable: boolean;
  isExpanded: boolean;
}): ExpandableOverlayDescriptionLayoutContract {
  if (!isExpandable) {
    return {
      actionPlacement: 'hidden',
      contentBottomLift: 0,
    };
  }

  if (!isExpanded) {
    return {
      actionPlacement: 'inline',
      contentBottomLift: 0,
    };
  }

  return {
    actionPlacement: 'footer',
    contentBottomLift: actionLaneHeight + actionGap,
  };
}

export function reduceExpandableOverlayDescriptionUiState(
  state: ExpandableOverlayDescriptionUiState,
  event: ExpandableOverlayDescriptionUiEvent
): ExpandableOverlayDescriptionUiState {
  switch (event.type) {
    case 'expand-pressed':
      return { isExpanded: true };
    case 'collapse-pressed':
    case 'description-changed':
    case 'became-inactive':
    case 'lost-expandability':
      return { isExpanded: false };
    default:
      return state;
  }
}

export function resolveExpandableOverlayDescriptionHeights(lineCount: number) {
  const visibleLineCount = Math.min(Math.max(0, lineCount), collapsedLineCount);
  const collapsedHeight = visibleLineCount * descriptionLineHeight;

  if (lineCount <= collapsedLineCount) {
    return {
      collapsedHeight,
      expandedHeight: collapsedHeight,
    };
  }

  return {
    collapsedHeight,
    expandedHeight: lineCount * descriptionLineHeight,
  };
}

export function resolveExpandableOverlayDescriptionCollapsedViewportHeight() {
  return collapsedLineCount * descriptionLineHeight;
}
