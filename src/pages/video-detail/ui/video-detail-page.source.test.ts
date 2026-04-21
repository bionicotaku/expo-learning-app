import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('video detail page source', () => {
  it('renders a route-keyed fullscreen session and keeps transcript source ownership out of the page', () => {
    const source = readFileSync(
      new URL('./video-detail-page.tsx', import.meta.url).pathname,
      'utf8'
    );

    expect(source).toContain('resolveVideoDetailRouteTarget');
    expect(source).toContain('FullscreenVideoSession');
    expect(source).toContain('key={routeTarget.sessionKey}');
    expect(source).toContain('items={canonicalItems}');
    expect(source).not.toContain('useVideoRuntimeStore');
    expect(source).not.toContain('useFullscreenTranscriptSource');
    expect(source).not.toContain('activeTranscriptVideoId');
    expect(source).not.toContain('activeTranscriptIndex');
    expect(source).not.toContain('activeTranscript={');
    expect(source).not.toContain('activeTranscriptStatus={');
    expect(source).not.toContain('handleActionPress');
    expect(source).not.toContain('onActionPress=');
    expect(source).not.toContain('fetchNextPage');
    expect(source).not.toContain('cursor');
    expect(source).not.toContain('offset');
  });
});
