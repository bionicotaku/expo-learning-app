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
    expect(source).not.toContain('useEffectiveVideoItems');
    expect(source).toContain('createVideoMediaFeatureCardProps');
    expect(source).not.toContain('createFeedMediaFeatureCardProps');
    expect(source).not.toContain('createFeedVideoOpenGate');
    expect(source).not.toContain('fetchNextPage');
    expect(source).not.toContain('cursor');
    expect(source).not.toContain('offset');
  });
});
