import { describe, expect, it } from 'vitest';

import { editorialPaperLightTokens } from '@/shared/theme/editorial-paper';

import {
  resolveSegmentedDragProgress,
  resolveSegmentedSliderFill,
  resolveSegmentedSliderMetrics,
  resolveSegmentedSnapIndex,
  SEGMENTED_FILTER_BAR_GAP,
} from './segmented-filter-bar-design';

describe('segmented filter bar design', () => {
  it('computes equal-width slider metrics inside the segmented row', () => {
    expect(
      resolveSegmentedSliderMetrics({
        containerWidth: 200,
        itemCount: 2,
        activeIndex: 1,
      })
    ).toEqual({
      segmentWidth: (200 - SEGMENTED_FILTER_BAR_GAP) / 2,
      translateX: (200 - SEGMENTED_FILTER_BAR_GAP) / 2 + SEGMENTED_FILTER_BAR_GAP,
    });
  });

  it('clamps the active index when resolving slider metrics', () => {
    expect(
      resolveSegmentedSliderMetrics({
        containerWidth: 200,
        itemCount: 2,
        activeIndex: 99,
      })
    ).toEqual({
      segmentWidth: (200 - SEGMENTED_FILTER_BAR_GAP) / 2,
      translateX: (200 - SEGMENTED_FILTER_BAR_GAP) / 2 + SEGMENTED_FILTER_BAR_GAP,
    });
  });

  it('builds a peach-to-rose gradient fill for peach selection', () => {
    expect(
      resolveSegmentedSliderFill(editorialPaperLightTokens, 'softActionPeach')
    ).toEqual({
      baseColor: editorialPaperLightTokens.color.softAction.peach,
      gradient:
        `linear-gradient(135deg, ${editorialPaperLightTokens.color.softAction.peach} 0%, ${editorialPaperLightTokens.color.softAction.rose} 100%)`,
    });
  });

  it('builds a butter-to-peach gradient fill for butter selection', () => {
    expect(
      resolveSegmentedSliderFill(editorialPaperLightTokens, 'softActionButter')
    ).toEqual({
      baseColor: editorialPaperLightTokens.color.softAction.butter,
      gradient:
        `linear-gradient(135deg, ${editorialPaperLightTokens.color.softAction.butter} 0%, ${editorialPaperLightTokens.color.softAction.peach} 100%)`,
    });
  });

  it('maps drag translation to clamped progress within the segmented range', () => {
    const metrics = resolveSegmentedSliderMetrics({
      containerWidth: 200,
      itemCount: 2,
      activeIndex: 0,
    });

    expect(
      resolveSegmentedDragProgress({
        startProgress: 0,
        translationX: (metrics.segmentWidth + SEGMENTED_FILTER_BAR_GAP) / 2,
        segmentWidth: metrics.segmentWidth,
        itemCount: 2,
      })
    ).toBe(0.5);

    expect(
      resolveSegmentedDragProgress({
        startProgress: 0,
        translationX: 999,
        segmentWidth: metrics.segmentWidth,
        itemCount: 2,
      })
    ).toBe(1);

    expect(
      resolveSegmentedDragProgress({
        startProgress: 1,
        translationX: -999,
        segmentWidth: metrics.segmentWidth,
        itemCount: 2,
      })
    ).toBe(0);
  });

  it('snaps drag progress to the nearest clamped segment index', () => {
    expect(resolveSegmentedSnapIndex({ progress: 0.2, itemCount: 2 })).toBe(0);
    expect(resolveSegmentedSnapIndex({ progress: 0.8, itemCount: 2 })).toBe(1);
    expect(resolveSegmentedSnapIndex({ progress: 9, itemCount: 2 })).toBe(1);
  });

  it('biases snap toward fling direction when velocity is high enough', () => {
    expect(
      resolveSegmentedSnapIndex({
        progress: 0.35,
        itemCount: 2,
        velocityX: 900,
      })
    ).toBe(1);

    expect(
      resolveSegmentedSnapIndex({
        progress: 0.65,
        itemCount: 2,
        velocityX: -900,
      })
    ).toBe(0);
  });
});
