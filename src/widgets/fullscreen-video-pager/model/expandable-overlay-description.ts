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

export type ExpandableOverlayDescriptionViewModel = {
  collapsedViewportHeight: number;
  currentExpansionKey: string | null;
  descriptionContainerHeight: number;
  isExpandable: boolean;
  isExpanded: boolean;
  isMeasurementReady: boolean;
  layoutContract: ExpandableOverlayDescriptionLayoutContract;
  mode: 'measuring' | 'static' | 'collapsed' | 'expanded';
};

type ExpandableOverlayDescriptionMeasurementTypography = Pick<
  FullscreenVideoOverlayTypography,
  'descriptionFontSize' | 'descriptionLineHeight'
>;

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

export function getExpandableOverlayDescriptionState(
  lines: readonly ExpandableOverlayDescriptionMeasuredLine[]
) {
  return {
    isExpandable: lines.length > collapsedLineCount,
    visibleLineCount: Math.min(lines.length, collapsedLineCount),
  };
}

export function resolveExpandableOverlayDescriptionViewModel({
  actionGap,
  actionLaneHeight,
  activeVisitToken,
  expandedExpansionKey,
  isMeasurementReady,
  lineCount,
  measurementKey,
}: {
  actionGap: number;
  actionLaneHeight: number;
  activeVisitToken: number | null;
  expandedExpansionKey: string | null;
  isMeasurementReady: boolean;
  lineCount: number;
  measurementKey: string;
}): ExpandableOverlayDescriptionViewModel {
  const currentExpansionKey =
    activeVisitToken === null ? null : `${activeVisitToken}:${measurementKey}`;
  const isExpandable = isMeasurementReady && lineCount > collapsedLineCount;
  const isExpanded =
    currentExpansionKey !== null &&
    isExpandable &&
    expandedExpansionKey === currentExpansionKey;
  const visibleLineCount = Math.min(Math.max(0, lineCount), collapsedLineCount);
  const collapsedViewportHeight =
    collapsedLineCount * fullscreenVideoOverlayTypography.descriptionLineHeight;
  const collapsedHeight =
    visibleLineCount * fullscreenVideoOverlayTypography.descriptionLineHeight;
  const expandedHeight =
    lineCount <= collapsedLineCount
      ? collapsedHeight
      : lineCount * fullscreenVideoOverlayTypography.descriptionLineHeight;

  if (!isMeasurementReady) {
    return {
      collapsedViewportHeight,
      currentExpansionKey,
      descriptionContainerHeight: collapsedHeight,
      isExpandable: false,
      isExpanded: false,
      isMeasurementReady,
      layoutContract: {
        actionPlacement: 'hidden',
        contentBottomLift: 0,
      },
      mode: 'measuring',
    };
  }

  if (lineCount <= collapsedLineCount) {
    return {
      collapsedViewportHeight,
      currentExpansionKey,
      descriptionContainerHeight: collapsedHeight,
      isExpandable: false,
      isExpanded: false,
      isMeasurementReady,
      layoutContract: {
        actionPlacement: 'hidden',
        contentBottomLift: 0,
      },
      mode: 'static',
    };
  }

  if (!isExpanded) {
    return {
      collapsedViewportHeight,
      currentExpansionKey,
      descriptionContainerHeight: collapsedHeight,
      isExpandable,
      isExpanded,
      isMeasurementReady,
      layoutContract: {
        actionPlacement: 'inline',
        contentBottomLift: 0,
      },
      mode: 'collapsed',
    };
  }

  return {
    collapsedViewportHeight,
    currentExpansionKey,
    descriptionContainerHeight: expandedHeight,
    isExpandable,
    isExpanded,
    isMeasurementReady,
    layoutContract: {
      actionPlacement: 'footer',
      contentBottomLift: actionLaneHeight + actionGap,
    },
    mode: 'expanded',
  };
}
