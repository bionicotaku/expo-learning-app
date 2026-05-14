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
    expect(source).toContain('const { flush, reportSample } = useVideoWatchProgressReporter');
    expect(source).not.toContain('Platform');
    expect(source).not.toContain('WatchProgressSource');
    expect(source).not.toContain('resolveWatchProgressSource');
    expect(source).toContain('activeTranscript,');
    expect(source).toContain('handleViewableItemsChanged');
    expect(source).toContain('acquirePlaybackHold');
    expect(source).toContain('createExpandableOverlayDescriptionMeasurementCache');
    expect(source).toContain('FullscreenVideoRow');
    expect(source).toContain('entryIndex');
    expect(source).toContain('onActiveVideoChange');
    expect(source).not.toContain('initialIndex');
    expect(source).not.toContain('onActiveItemChange');
    expect(source).not.toContain('PausedPlaybackIndicatorOverlay');
    expect(source).not.toContain('PlaybackFeedbackOverlay');
    expect(source).toContain('const renderState = useMemo');
    expect(source).toContain('subtitleDisplayMode');
    expect(source).toContain('videoDetailsVisible');
    expect(source).toContain('activeTranscript');
    expect(source).toContain('videoMetaByVideoId');
    expect(source).toContain('handleProgressSnapshotForTelemetry');
    expect(source).toContain('handlePlaybackEnd');
    expect(source).toContain('resolveNextFullscreenVideoIndex');
    expect(source).toContain('listRef.current?.scrollToIndex({');
    expect(source).toContain('animated: true');
    expect(source).toContain('reportSample({');
    expect(source).toContain('playbackRate,');
    expect(source).toContain('const isCurrentActiveItem = rowRenderState.isActive');
    expect(source).not.toContain('const isCurrentActiveItem = item.videoId === activeItemId');
    expect(source).toContain('setInterval(() => {');
    expect(source).toContain('}, 10_000)');
    expect(source).toContain('void flush();');
    expect(source).toContain('}, [flush])');
    expect(source).not.toContain('shouldReserveSubtitleSpace');
    expect(source).toContain('extraData={renderState}');
    expect(source).toContain(
      'registerActiveController={\n            isCurrentActiveItem ? registerActiveController : undefined'
    );
    expect(source).toContain(
      'acquirePlaybackHold={isCurrentActiveItem ? acquirePlaybackHold : undefined}'
    );
    expect(source).toContain('activeVisitToken={rowRenderState.activeVisitToken}');
    expect(source).toContain('watchSessionId={rowRenderState.watchSessionId}');
    expect(source).toContain('onPlaybackEnd={isCurrentActiveItem ? handlePlaybackEnd : undefined}');
    expect(source).toContain(
      'onProgressSnapshotForTelemetry={\n            isCurrentActiveItem ? handleProgressSnapshotForTelemetry : undefined'
    );
    expect(source).toContain(
      'activeTranscript={isCurrentActiveItem ? activeTranscript : null}'
    );
    expect(source).toContain('videoMeta={videoMetaByVideoId.get(item.videoId) ?? null}');
    expect(source).toContain('subtitleDisplayMode={subtitleDisplayMode}');
    expect(source).toContain('videoDetailsVisible={videoDetailsVisible}');
    expect(source).toContain('measurementCache={descriptionMeasurementCacheRef.current}');
    expect(source).not.toContain('onActionPress?:');
    expect(source).not.toContain('onActionPress={onActionPress}');
    expect(source).toContain('onCenterHoldStart?: () => void');
    expect(source).toContain("if (zone === 'center')");
    expect(source).toContain('onCenterHoldStart?.()');
    expect(source).toContain('handleHoldStart(zone)');
    expect(source).not.toContain('resolveActiveVideoChange');
    expect(source).not.toContain('reportVideoWatchProgress');
    expect(source).not.toContain('requestJson');
    expect(source).not.toContain('watchProgressReporter');
  });
});
