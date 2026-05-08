import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('fullscreen video pager source', () => {
  it('keeps a wider virtualization window around the active video', () => {
    const source = readFileSync(
      new URL('./fullscreen-video-pager.tsx', import.meta.url).pathname,
      'utf8'
    );

    expect(source).toContain('initialNumToRender={5}');
    expect(source).toContain('maxToRenderPerBatch={6}');
    expect(source).toContain('windowSize={7}');
    expect(source).not.toContain('bounces={false}');
    expect(source).not.toContain('GestureDetector');
  });

  it('delegates playback session state to a dedicated hook and mounts rows instead of pager-level HUD overlays', () => {
    const source = readFileSync(
      new URL('./fullscreen-video-pager.tsx', import.meta.url).pathname,
      'utf8'
    );

    expect(source).toContain('useFullscreenPlaybackSession');
    expect(source).toContain('handleViewableItemsChanged');
    expect(source).toContain('createExpandableOverlayDescriptionMeasurementCache');
    expect(source).toContain('FullscreenVideoRow');
    expect(source).toContain('entryIndex');
    expect(source).toContain('onActiveVideoChange');
    expect(source).not.toContain('initialIndex');
    expect(source).not.toContain('onActiveItemChange');
    expect(source).not.toContain('PausedPlaybackIndicatorOverlay');
    expect(source).not.toContain('PlaybackFeedbackOverlay');
    expect(source).toContain('const renderState = useMemo');
    expect(source).toContain('extraData={renderState}');
    expect(source).toContain(
      'registerActiveController={\n            isCurrentActiveItem ? registerActiveController : undefined'
    );
    expect(source).toContain('activeVisitToken={rowRenderState.activeVisitToken}');
    expect(source).toContain('measurementCache={descriptionMeasurementCacheRef.current}');
    expect(source).toContain('onActionPress={onActionPress}');
    expect(source).toContain('onCenterHoldStart?: () => void');
    expect(source).toContain("if (zone === 'center')");
    expect(source).toContain('onCenterHoldStart?.()');
    expect(source).toContain('handleHoldStart(zone)');
    expect(source).not.toContain('resolveActiveVideoChange');
    expect(source).not.toContain('progressSnapshot');
  });
});
