import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('video detail page source', () => {
  it('renders a route-keyed fullscreen session, keeps transcript source ownership out of the page, and seeds restore target from the route entry target', () => {
    const source = readFileSync(
      new URL('./video-detail-page.tsx', import.meta.url).pathname,
      'utf8'
    );

    expect(source).toContain('resolveVideoDetailRouteTarget');
    expect(source).toContain('FullscreenVideoSession');
    expect(source).toContain('key={routeTarget.sessionKey}');
    expect(source).toContain('items={canonicalItems}');
    expect(source).toContain('latestRestoreVideoIdRef');
    expect(source).toContain('seededSessionKeyRef');
    expect(source).toContain('routeTarget.entryVideoId');
    expect(source).toContain('routeTarget.sessionKey');
    expect(source).toContain('setPendingRestoreVideoId(latestRestoreVideoIdRef.current)');
    expect(source).not.toContain('useVideoRuntimeStore');
    expect(source).not.toContain('useFullscreenTranscriptSource');
    expect(source).not.toContain('activeTranscriptVideoId');
    expect(source).not.toContain('activeTranscriptIndex');
    expect(source).not.toContain('latestActiveItemIdRef');
    expect(source).not.toContain('activeTranscript={');
    expect(source).not.toContain('activeTranscriptStatus={');
    expect(source).not.toContain('handleActionPress');
    expect(source).not.toContain('onActionPress=');
    expect(source).not.toContain('fetchNextPage');
    expect(source).not.toContain('cursor');
    expect(source).not.toContain('offset');
  });
});
