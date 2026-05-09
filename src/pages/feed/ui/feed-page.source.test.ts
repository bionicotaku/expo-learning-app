import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('feed page source', () => {
  it('opens fullscreen with the feed video id and requests another batch from the shared source at the list tail', () => {
    const source = readFileSync(
      new URL('./feed-page.tsx', import.meta.url).pathname,
      'utf8'
    );

    expect(source).toContain('router.navigate(`/video/${item.videoId}` as never);');
    expect(source).toContain('requestMore');
    expect(source).toContain('createTailRequestGate');
    expect(source).toContain('requestMoreForTail');
    expect(source).toContain('onEndReached');
    expect(source).toContain('ListEmptyComponent={renderEmptyState}');
    expect(source).toContain('RefreshControl');
    expect(source).toContain('ActivityIndicator');
    expect(source).toContain("toast.show({");
    expect(source).toContain("title: '加载失败'");
    expect(source).toContain("title: '刷新失败'");
    expect(source).not.toContain('lastRequestedTailVideoIdRef');
    expect(source).not.toContain('useEffectiveVideoItems');
    expect(source).toContain('createVideoMediaFeatureCardProps');
    expect(source).not.toContain('createFeedMediaFeatureCardProps');
    expect(source).not.toContain('createFeedVideoOpenGate');
    expect(source).not.toContain('getFeedListLoadingState');
    expect(source).not.toContain('actionLabel=\"Retry\"');
    expect(source).not.toContain("loadingState.kind === 'initial-loading'");
    expect(source).not.toContain('Loading video feed…');
    expect(source).not.toContain('fetchNextPage');
    expect(source).not.toContain('cursor');
    expect(source).not.toContain('offset');
  });
});
