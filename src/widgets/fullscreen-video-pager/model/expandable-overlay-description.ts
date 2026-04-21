export type ExpandableOverlayDescriptionMeasuredLine = {
  text: string;
};

export type ExpandableOverlayDescriptionMeasurement = {
  key: string;
  lines: readonly ExpandableOverlayDescriptionMeasuredLine[];
};

export type FullscreenVideoOverlayTypography = {
  actionFontSize: number;
  actionLaneHeight: number;
  actionLineHeight: number;
  descriptionFontSize: number;
  descriptionLineHeight: number;
  titleFontSize: number;
  titleLineHeight: number;
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
  expandedContentKey: string | null;
};

type ExpandableOverlayDescriptionUiEvent =
  | { type: 'collapse-pressed' }
  | { type: 'content-invalidated' }
  | { contentKey: string; type: 'expand-pressed' };

type ExpandableOverlayDescriptionRenderMode =
  | 'measuring'
  | 'static'
  | 'collapsed'
  | 'expanded';

const collapsedLineCount = 2;
const defaultMeasurementCacheLimit = 120;

export const fullscreenVideoOverlayTypography: Readonly<FullscreenVideoOverlayTypography> = {
  actionFontSize: 13.5,
  actionLaneHeight: 16,
  actionLineHeight: 16,
  descriptionFontSize: 13.5,
  descriptionLineHeight: 16,
  titleFontSize: 15,
  titleLineHeight: 18,
};

export function createExpandableOverlayDescriptionMeasurementTypographyKey(
  typography: FullscreenVideoOverlayTypography
) {
  return [
    `title:${typography.titleFontSize}/${typography.titleLineHeight}`,
    `description:${typography.descriptionFontSize}/${typography.descriptionLineHeight}`,
    `action:${typography.actionFontSize}/${typography.actionLineHeight}`,
    `lane:${typography.actionLaneHeight}`,
  ].join('|');
}

export function createExpandableOverlayDescriptionContentKey({
  measurementKey,
  stateOwnerKey,
}: {
  measurementKey: string;
  stateOwnerKey: string;
}) {
  return `${stateOwnerKey}:${measurementKey}`;
}

export function createExpandableOverlayDescriptionMeasurementKey({
  description,
  maxTextWidth,
  typographyKey,
}: {
  description: string;
  maxTextWidth: number;
  typographyKey: string;
}) {
  const normalizedWidth = maxTextWidth.toFixed(2);

  return `${typographyKey}:${normalizedWidth}:${description}`;
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
  const lines = cache.entries.get(measurementKey);

  if (!lines) {
    return undefined;
  }

  cache.entries.delete(measurementKey);
  cache.entries.set(measurementKey, lines);

  return lines;
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

export function resolveExpandableOverlayDescriptionExpandedState({
  contentKey,
  expandedContentKey,
  isActive,
  isExpandable,
}: {
  contentKey: string;
  expandedContentKey: string | null;
  isActive: boolean;
  isExpandable: boolean;
}) {
  return isActive && isExpandable && expandedContentKey === contentKey;
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
      return { expandedContentKey: event.contentKey };
    case 'collapse-pressed':
    case 'content-invalidated':
      return { expandedContentKey: null };
    default:
      return state;
  }
}

export function resolveExpandableOverlayDescriptionHeights(lineCount: number) {
  const visibleLineCount = Math.min(Math.max(0, lineCount), collapsedLineCount);
  const collapsedHeight =
    visibleLineCount * fullscreenVideoOverlayTypography.descriptionLineHeight;

  if (lineCount <= collapsedLineCount) {
    return {
      collapsedHeight,
      expandedHeight: collapsedHeight,
    };
  }

  return {
    collapsedHeight,
    expandedHeight:
      lineCount * fullscreenVideoOverlayTypography.descriptionLineHeight,
  };
}

export function resolveExpandableOverlayDescriptionCollapsedViewportHeight() {
  return (
    collapsedLineCount * fullscreenVideoOverlayTypography.descriptionLineHeight
  );
}
