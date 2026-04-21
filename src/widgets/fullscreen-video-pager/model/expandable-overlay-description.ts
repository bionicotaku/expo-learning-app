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

type ExpandableOverlayDescriptionBaseViewState = {
  collapsedViewportHeight: number;
  descriptionContainerHeight: number;
};

type ExpandableOverlayDescriptionMeasuringViewState =
  ExpandableOverlayDescriptionBaseViewState & {
    actionPlacement: 'hidden';
    mode: 'measuring';
  };

type ExpandableOverlayDescriptionStaticViewState =
  ExpandableOverlayDescriptionBaseViewState & {
    actionPlacement: 'hidden';
    mode: 'static';
  };

type ExpandableOverlayDescriptionCollapsedViewState =
  ExpandableOverlayDescriptionBaseViewState & {
    actionPlacement: 'inline';
    mode: 'collapsed';
  };

type ExpandableOverlayDescriptionExpandedViewState =
  ExpandableOverlayDescriptionBaseViewState & {
    actionPlacement: 'footer';
    mode: 'expanded';
  };

export type ExpandableOverlayDescriptionViewState =
  | ExpandableOverlayDescriptionMeasuringViewState
  | ExpandableOverlayDescriptionStaticViewState
  | ExpandableOverlayDescriptionCollapsedViewState
  | ExpandableOverlayDescriptionExpandedViewState;

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
  hasValidMeasurement,
  expandedExpansionKey,
  isDescriptionEmpty,
  lineCount,
  measurementKey,
}: {
  activeVisitToken: number | null;
  descriptionLineHeight: number;
  hasValidMeasurement: boolean;
  expandedExpansionKey: string | null;
  isDescriptionEmpty: boolean;
  lineCount: number;
  measurementKey: string;
}): ExpandableOverlayDescriptionViewState {
  const collapsedViewportHeight = collapsedLineCount * descriptionLineHeight;

  if (isDescriptionEmpty) {
    return {
      actionPlacement: 'hidden',
      collapsedViewportHeight,
      descriptionContainerHeight: 0,
      mode: 'static',
    };
  }

  if (!hasValidMeasurement) {
    return {
      actionPlacement: 'hidden',
      collapsedViewportHeight,
      descriptionContainerHeight: collapsedViewportHeight,
      mode: 'measuring',
    };
  }

  const currentExpansionKey =
    activeVisitToken === null ? null : `${activeVisitToken}:${measurementKey}`;
  const isExpanded =
    currentExpansionKey !== null && expandedExpansionKey === currentExpansionKey;
  const visibleLineCount = Math.min(Math.max(0, lineCount), collapsedLineCount);
  const collapsedHeight = visibleLineCount * descriptionLineHeight;
  const expandedHeight =
    lineCount <= collapsedLineCount
      ? collapsedHeight
      : lineCount * descriptionLineHeight;

  if (lineCount <= collapsedLineCount) {
    return {
      actionPlacement: 'hidden',
      collapsedViewportHeight,
      descriptionContainerHeight: collapsedHeight,
      mode: 'static',
    };
  }

  if (!isExpanded) {
    return {
      actionPlacement: 'inline',
      collapsedViewportHeight,
      descriptionContainerHeight: collapsedHeight,
      mode: 'collapsed',
    };
  }

  return {
    actionPlacement: 'footer',
    collapsedViewportHeight,
    descriptionContainerHeight: expandedHeight,
    mode: 'expanded',
  };
}
