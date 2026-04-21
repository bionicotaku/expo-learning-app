import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('expandable overlay description source', () => {
  it('exports one description state module that drives both the text presenter and the fixed action lane', () => {
    const source = readFileSync(
      new URL('./expandable-overlay-description.tsx', import.meta.url).pathname,
      'utf8'
    );

    expect(source).toContain('memo');
    expect(source).toContain('useState');
    expect(source).toContain('Pressable');
    expect(source).toContain('useExpandableOverlayDescriptionState');
    expect(source).toContain('ExpandableOverlayDescriptionAction');
    expect(source).toContain('measurementCache');
    expect(source).toContain('activeVisitToken');
    expect(source).toContain('onTextLayout');
    expect(source).toContain('resolveExpandableOverlayDescriptionViewState');
    expect(source).toContain('peekExpandableOverlayDescriptionMeasurementCache');
    expect(source).toContain('writeExpandableOverlayDescriptionMeasurementCache');
    expect(source).toContain("../model/fullscreen-video-overlay-theme");
    expect(source).toContain('allowFontScaling={false}');
    expect(source).toContain("numberOfLines={mode === 'collapsed' ? 2 : undefined}");
    expect(source).toContain(
      "ellipsizeMode={mode === 'collapsed' ? 'tail' : undefined}"
    );
    expect(source).toContain(
      "overflow: mode === 'collapsed' || mode === 'expanded' ? 'hidden' : 'visible'"
    );
    expect(source).toContain('descriptionActionReserveWidth');
    expect(source).toContain("expandLabel = '展开'");
    expect(source).toContain("collapseLabel = '收起'");
    expect(source).toContain('useAnimatedStyle');
    expect(source).toContain('withTiming');
    expect(source).toContain("mode === 'measuring'");
    expect(source).toContain("mode === 'collapsed'");
    expect(source).toContain('viewState');
    expect(source).toContain('actionPlacement');
    expect(source).toContain('isExpanded');
    expect(source).toContain('isExpandable');
    expect(source).toContain('createExpandableOverlayDescriptionMeasurementKey');
    expect(source).toContain('normalizeExpandableOverlayDescriptionMeasuredLineText');
    expect(source).toContain("position: 'absolute'");
    expect(source).toContain('opacity: 0');
    expect(source).not.toContain('stateOwnerKey');
    expect(source).not.toContain('isActive');
    expect(source).not.toContain('fullscreenVideoOverlayTypography');
    expect(source).not.toContain('layoutContract');
    expect(source).not.toContain('resolveExpandableOverlayDescriptionRenderMode');
    expect(source).not.toContain('resolveExpandableOverlayDescriptionLayoutContract');
    expect(source).not.toContain('reduceExpandableOverlayDescriptionUiState');
    expect(source).not.toContain('resolveExpandableOverlayDescriptionExpandedState');
    expect(source).not.toContain('readExpandableOverlayDescriptionMeasurementCache');
    expect(source).not.toContain('resolveExpandableOverlayDescriptionMeasurementSnapshot');
    expect(source).not.toContain('useWindowDimensions');
    expect(source).not.toContain('fontScale');
    expect(source).not.toContain('LinearTransition');
    expect(source).not.toContain('Animated.View');
    expect(source).not.toContain('paddingBottom: descriptionTextStyle.lineHeight');
    expect(source).not.toContain('onExpandableChange');
    expect(source).not.toContain('const descriptionMeasurementCache = new Map');
    expect(source).not.toContain("type: 'content-invalidated'");
    expect(source).not.toContain('useSharedValue');
  });
});
