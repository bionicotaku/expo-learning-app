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
    expect(source).toContain('onRowUnmount');
    expect(source).not.toContain('ActiveVideoGestureSurface');
    expect(source).not.toContain('railGestureBlockers');
    expect(source).not.toContain('externalGestureBlockers');
    expect(source).not.toContain('onRailGesturesChange');
    expect(source).not.toContain('const [isScrubbing, setIsScrubbing]');
    expect(source).toContain('resolveRowHudCenterOwner');
    expect(source).toContain('shouldReserveCenterForPause');
    expect(source).toContain('useVideoRuntimeState');
    expect(source).toContain('const handleActionPress = useCallback(');
    expect(source).toContain("if (item.id === 'like')");
    expect(source).toContain("if (item.id === 'favorite')");
    expect(source).toContain('onActionPress?.(video.videoId, item);');
    expect(source).toContain('previousProps.video.isLiked === nextProps.video.isLiked');
    expect(source).toContain('previousProps.video.isFavorited === nextProps.video.isFavorited');
    expect(source).toContain('showCenteredPause={showCenteredPause}');
    expect(source).toContain('centerOwner={centerOwner}');
    expect(source).not.toContain('const [progressSnapshot, setProgressSnapshot]');
    expect(source).not.toContain('onActiveProgressSnapshotChange={isActive ? setProgressSnapshot : undefined}');
  });
});
