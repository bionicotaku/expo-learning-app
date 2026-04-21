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

export type ExpandableOverlayDescriptionMeasurementTypography = {
  descriptionFontSize: number;
  descriptionLineHeight: number;
};

export type ExpandableOverlayDescriptionActionPlacement =
  | 'hidden'
  | 'inline'
  | 'footer';

export type ExpandableOverlayDescriptionViewState = {
  actionPlacement: ExpandableOverlayDescriptionActionPlacement;
  collapsedViewportHeight: number;
  descriptionContainerHeight: number;
  isExpandable: boolean;
  isExpanded: boolean;
  isMeasurementReady: boolean;
  mode: 'measuring' | 'static' | 'collapsed' | 'expanded';
};

const collapsedLineCount = 2;
const defaultMeasurementCacheLimit = 120;

export function createExpandableOverlayDescriptionMeasurementTypographyKey(
  typography: ExpandableOverlayDescriptionMeasurementTypography
) {
  return `description:${typography.descriptionFontSize}/${typography.descriptionLineHeight}`;
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

export function peekExpandableOverlayDescriptionMeasurementCache(
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

export function resolveExpandableOverlayDescriptionViewState({
  activeVisitToken,
  descriptionLineHeight,
  expandedExpansionKey,
  isMeasurementReady,
  lineCount,
  measurementKey,
}: {
  activeVisitToken: number | null;
  descriptionLineHeight: number;
  expandedExpansionKey: string | null;
  isMeasurementReady: boolean;
  lineCount: number;
  measurementKey: string;
}): ExpandableOverlayDescriptionViewState {
  const currentExpansionKey =
    activeVisitToken === null ? null : `${activeVisitToken}:${measurementKey}`;
  const isExpandable = isMeasurementReady && lineCount > collapsedLineCount;
  const isExpanded =
    currentExpansionKey !== null &&
    isExpandable &&
    expandedExpansionKey === currentExpansionKey;
  const visibleLineCount = Math.min(Math.max(0, lineCount), collapsedLineCount);
  const collapsedViewportHeight = collapsedLineCount * descriptionLineHeight;
  const collapsedHeight = visibleLineCount * descriptionLineHeight;
  const expandedHeight =
    lineCount <= collapsedLineCount
      ? collapsedHeight
      : lineCount * descriptionLineHeight;

  if (!isMeasurementReady) {
    return {
      actionPlacement: 'hidden',
      collapsedViewportHeight,
      descriptionContainerHeight: collapsedHeight,
      isExpandable: false,
      isExpanded: false,
      isMeasurementReady,
      mode: 'measuring',
    };
  }

  if (lineCount <= collapsedLineCount) {
    return {
      actionPlacement: 'hidden',
      collapsedViewportHeight,
      descriptionContainerHeight: collapsedHeight,
      isExpandable: false,
      isExpanded: false,
      isMeasurementReady,
      mode: 'static',
    };
  }

  if (!isExpanded) {
    return {
      actionPlacement: 'inline',
      collapsedViewportHeight,
      descriptionContainerHeight: collapsedHeight,
      isExpandable,
      isExpanded,
      isMeasurementReady,
      mode: 'collapsed',
    };
  }

  return {
    actionPlacement: 'footer',
    collapsedViewportHeight,
    descriptionContainerHeight: expandedHeight,
    isExpandable,
    isExpanded,
    isMeasurementReady,
    mode: 'expanded',
  };
}
