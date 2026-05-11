import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('fullscreen video row source', () => {
  it('mounts media, interaction, content, HUD, and surface status as separate sibling layers', () => {
    const source = readFileSync(
      new URL('./fullscreen-video-row.tsx', import.meta.url).pathname,
      'utf8'
    );

    expect(source).toContain('RowPlaybackMediaLayer');
    expect(source).toContain('RowPlaybackInteractionLayer');
    expect(source).toContain('RowOwnedVideoOverlay');
    expect(source).toContain('RowPlaybackHudOverlay');
    expect(source).toContain('RowSurfaceStatusOverlay');
    expect(source).toContain('usePresentWordDetailDialog');
    expect(source).toContain('createWordDetailDialogDataFromTranscriptToken');
    expect(source).toContain('sentenceAudio');
    expect(source).toContain('videoUrl: video.videoUrl');
    expect(source).toContain('acquirePlaybackHold?: () => () => void');
    expect(source).toContain('const releasePlaybackHold = acquirePlaybackHold?.();');
    expect(source).toContain('const didPresentWordDetailDialog = presentWordDetailDialog(payload, {');
    expect(source).toContain('if (!didPresentWordDetailDialog) {');
    expect(source).toContain('releasePlaybackHold?.();');
    expect(source).toContain('onDismissComplete: releasePlaybackHold');
    expect(source).toContain('useCycleSubtitleDisplayMode');
    expect(source).toContain('onRowUnmount');
    expect(source).not.toContain('ActiveVideoGestureSurface');
    expect(source).not.toContain('railGestureBlockers');
    expect(source).not.toContain('externalGestureBlockers');
    expect(source).not.toContain('onRailGesturesChange');
    expect(source).not.toContain('const [isScrubbing, setIsScrubbing]');
    expect(source).toContain('resolveRowHudCenterOwner');
    expect(source).toContain('shouldReserveCenterForPause');
    expect(source).toContain('useVideoEngagementState');
    expect(source).not.toContain('useVideoRuntimeState');
    expect(source).toContain('const handleActionPress = useCallback(');
    expect(source).toContain("if (item.id === 'like')");
    expect(source).toContain("if (item.id === 'favorite')");
    expect(source).toContain("if (item.id === 'subtitle')");
    expect(source).toContain('cycleSubtitleDisplayMode();');
    expect(source).not.toContain('onActionPress?: (videoId: string, item: FullscreenVideoOverlayActionItem) => void;');
    expect(source).not.toContain('onActionPress?.(video.videoId, item);');
    expect(source).toContain('videoMeta');
    expect(source).not.toContain('resolveEffectiveEngagementCount');
    expect(source).not.toContain('const effectiveLikeCount');
    expect(source).not.toContain('const effectiveFavoriteCount');
    expect(source).toContain('baseIsFavorited: videoMeta?.isFavorited ?? false');
    expect(source).toContain('baseIsLiked: videoMeta?.isLiked ?? false');
    expect(source).toContain('isEnabled: videoMeta !== null');
    expect(source).toContain('isLikeActionDisabled={videoMeta === null || isLikePending}');
    expect(source).toContain('isFavoriteActionDisabled={videoMeta === null || isFavoritePending}');
    expect(source).toContain('likeCount={likeCount}');
    expect(source).toContain('favoriteCount={favoriteCount}');
    expect(source).toContain('activeVisitToken={activeVisitToken}');
    expect(source).toContain('onProgressSnapshotForTelemetry?:');
    expect(source).toContain('const handleActiveProgressSnapshotChange = useCallback(');
    expect(source).toContain(
      'onProgressSnapshotForTelemetry?.(video.videoId, activeVisitToken, snapshot);'
    );
    expect(source).toContain('onActiveProgressSnapshotChange={handleActiveProgressSnapshotChange}');
    expect(source).toContain('activeTranscript={activeTranscript}');
    expect(source).toContain('subtitleDisplayMode={subtitleDisplayMode}');
    expect(source).toContain('videoDetailsVisible={videoDetailsVisible}');
    expect(source).toContain('seekBarStore={seekBarStore}');
    expect(source).toContain('onSubtitleTokenPress={handleSubtitleTokenPress}');
    expect(source).not.toContain('player.pause()');
    expect(source).not.toContain('player.play()');
    expect(source).not.toContain('shouldReserveSubtitleSpace');
    expect(source).toContain('activeVisitToken: previousProps.activeVisitToken');
    expect(source).toContain('activeVisitToken: nextProps.activeVisitToken');
    expect(source).toContain('isActive={isActive}');
    expect(source).toContain('previousProps.videoMeta === nextProps.videoMeta');
    expect(source).toContain('previousProps.video.likeCount === nextProps.video.likeCount');
    expect(source).toContain('previousProps.video.favoriteCount === nextProps.video.favoriteCount');
    expect(source).not.toContain('previousProps.video.isLiked === nextProps.video.isLiked');
    expect(source).not.toContain('previousProps.video.isFavorited === nextProps.video.isFavorited');
    expect(source).toContain('previousProps.activeTranscript === nextProps.activeTranscript');
    expect(source).toContain('previousProps.subtitleDisplayMode === nextProps.subtitleDisplayMode');
    expect(source).toContain('previousProps.videoDetailsVisible === nextProps.videoDetailsVisible');
    expect(source).toContain('previousProps.acquirePlaybackHold === nextProps.acquirePlaybackHold');
    expect(source).toContain(
      'previousProps.onProgressSnapshotForTelemetry ===\n      nextProps.onProgressSnapshotForTelemetry'
    );
    expect(source).toContain('showCenteredPause={showCenteredPause}');
    expect(source).toContain('centerOwner={centerOwner}');
    expect(source).not.toContain('const [progressSnapshot, setProgressSnapshot]');
    expect(source).not.toContain('onActiveProgressSnapshotChange={isActive ? setProgressSnapshot : undefined}');
  });
});
