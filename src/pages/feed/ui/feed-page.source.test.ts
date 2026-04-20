import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('feed page source', () => {
  it('opens fullscreen with navigate and keeps no local gate', () => {
    const source = readFileSync(
      new URL('./feed-page.tsx', import.meta.url).pathname,
      'utf8'
    );

    expect(source).toContain('router.navigate(`/video/${item.id}` as never);');
    expect(source).not.toContain('createFeedVideoOpenGate');
    expect(source).not.toContain('videoOpenGateRef');
    expect(source).not.toContain('router.push(`/video/${item.id}` as never);');
  });
});
