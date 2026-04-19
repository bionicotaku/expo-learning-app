import type { EditorialPaperTokens } from '@/shared/theme/editorial-paper';

import type { EditorialPaperTone } from './types';
import { resolveEditorialPaperToneColor } from './utils';

export const SEGMENTED_FILTER_BAR_PADDING = 6;
export const SEGMENTED_FILTER_BAR_GAP = 4;
export const SEGMENTED_FILTER_BAR_MIN_HEIGHT = 34;
export const SEGMENTED_FILTER_BAR_ANIMATION_DURATION_MS = 220;
export const SEGMENTED_FILTER_BAR_SNAP_VELOCITY_THRESHOLD = 480;
export const SEGMENTED_FILTER_BAR_SETTLE_SPRING = {
  damping: 25,
  stiffness: 220,
  mass: 0.95,
};

type SegmentedSliderMetricsInput = {
  containerWidth: number;
  itemCount: number;
  activeIndex: number;
};

export function resolveSegmentedSliderMetrics({
  containerWidth,
  itemCount,
  activeIndex,
}: SegmentedSliderMetricsInput) {
  'worklet';

  if (containerWidth <= 0 || itemCount <= 0) {
    return {
      segmentWidth: 0,
      translateX: 0,
    };
  }

  const clampedIndex = Math.max(0, Math.min(activeIndex, itemCount - 1));
  const totalGap = SEGMENTED_FILTER_BAR_GAP * Math.max(0, itemCount - 1);
  const segmentWidth = Math.max(0, (containerWidth - totalGap) / itemCount);

  return {
    segmentWidth,
    translateX: clampedIndex * (segmentWidth + SEGMENTED_FILTER_BAR_GAP),
  };
}

type SegmentedDragProgressInput = {
  startProgress: number;
  translationX: number;
  segmentWidth: number;
  itemCount: number;
};

export function resolveSegmentedDragProgress({
  startProgress,
  translationX,
  segmentWidth,
  itemCount,
}: SegmentedDragProgressInput) {
  'worklet';

  if (itemCount <= 1 || segmentWidth <= 0) {
    return 0;
  }

  const segmentSpan = segmentWidth + SEGMENTED_FILTER_BAR_GAP;
  const rawProgress = startProgress + translationX / segmentSpan;

  return Math.max(0, Math.min(rawProgress, itemCount - 1));
}

type SegmentedSnapIndexInput = {
  progress: number;
  itemCount: number;
  velocityX?: number;
};

export function resolveSegmentedSnapIndex({
  progress,
  itemCount,
  velocityX = 0,
}: SegmentedSnapIndexInput) {
  'worklet';

  if (itemCount <= 1) {
    return 0;
  }

  const clampedProgress = Math.max(0, Math.min(progress, itemCount - 1));

  if (Math.abs(velocityX) >= SEGMENTED_FILTER_BAR_SNAP_VELOCITY_THRESHOLD) {
    const direction = velocityX > 0 ? 1 : -1;
    const biasedIndex =
      direction > 0 ? Math.ceil(clampedProgress) : Math.floor(clampedProgress);

    return Math.max(0, Math.min(biasedIndex, itemCount - 1));
  }

  return Math.max(0, Math.min(Math.round(clampedProgress), itemCount - 1));
}

export function resolveSegmentedSliderFill(
  tokens: EditorialPaperTokens,
  tone: EditorialPaperTone
) {
  const baseColor = resolveEditorialPaperToneColor(tokens, tone);

  switch (tone) {
    case 'softActionRose':
      return {
        baseColor,
        gradient: `linear-gradient(135deg, ${tokens.color.softAction.rose} 0%, ${tokens.color.softAction.peach} 100%)`,
      };
    case 'softActionButter':
      return {
        baseColor,
        gradient: `linear-gradient(135deg, ${tokens.color.softAction.butter} 0%, ${tokens.color.softAction.peach} 100%)`,
      };
    case 'softActionPistachio':
      return {
        baseColor,
        gradient: `linear-gradient(135deg, ${tokens.color.softAction.pistachio} 0%, ${tokens.color.softAction.butter} 100%)`,
      };
    case 'softActionLavender':
      return {
        baseColor,
        gradient: `linear-gradient(135deg, ${tokens.color.softAction.lavender} 0%, ${tokens.color.softAction.sky} 100%)`,
      };
    case 'softActionSky':
      return {
        baseColor,
        gradient: `linear-gradient(135deg, ${tokens.color.softAction.sky} 0%, ${tokens.color.softAction.lavender} 100%)`,
      };
    case 'softActionPeach':
      return {
        baseColor,
        gradient: `linear-gradient(135deg, ${tokens.color.softAction.peach} 0%, ${tokens.color.softAction.rose} 100%)`,
      };
    case 'background':
    case 'surface':
    case 'accent':
    case 'gold':
    case 'cocoa':
    default:
      return {
        baseColor,
        gradient: `linear-gradient(135deg, ${baseColor} 0%, ${tokens.color.surface} 100%)`,
      };
  }
}
