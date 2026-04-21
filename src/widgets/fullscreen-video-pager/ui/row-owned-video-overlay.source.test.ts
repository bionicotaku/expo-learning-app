import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('row owned video overlay source', () => {
  it('keeps the row overlay focused on layout while consuming one description state module for text and action lane', () => {
    const source = readFileSync(
      new URL('./row-owned-video-overlay.tsx', import.meta.url).pathname,
      'utf8'
    );

    expect(source).toContain('memo');
    expect(source).toContain('export const RowOwnedVideoOverlay = memo(');
    expect(source).toContain('VideoOverlayActionRail');
    expect(source).toContain('ExpandableOverlayDescription');
    expect(source).toContain('ExpandableOverlayDescriptionAction');
    expect(source).toContain('useExpandableOverlayDescriptionState');
    expect(source).toContain('measurementCache');
    expect(source).toContain('videoId');
    expect(source).toContain('layoutContract.contentBottomLift');
    expect(source).toContain('allowFontScaling={false}');
    expect(source).toContain('isActive');
    expect(source).toContain('isLiked');
    expect(source).toContain('isFavorited');
    expect(source).toContain('LinearTransition.springify()');
    expect(source).toContain("position: 'absolute'");
    expect(source).not.toContain('useState');
    expect(source).not.toContain('useEffect');
    expect(source).not.toContain("expandLabel = '展开'");
    expect(source).not.toContain("collapseLabel = '收起'");
    expect(source).not.toContain('setIsExpanded');
    expect(source).not.toContain('setMeasurement');
    expect(source).not.toContain('descriptionState.isExpanded && descriptionState.isExpandable');
  });
});
