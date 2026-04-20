import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('video detail page source', () => {
  it('requests another feed batch when fullscreen approaches the loaded tail without reintroducing pagination params', () => {
    const source = readFileSync(
      new URL('./video-detail-page.tsx', import.meta.url).pathname,
      'utf8'
    );

    expect(source).toContain('requestMore');
    expect(source).toContain('items={canonicalItems}');
    expect(source).not.toContain('useVideoRuntimeStore');
    expect(source).not.toContain('handleActionPress');
    expect(source).not.toContain('onActionPress=');
    expect(source).not.toContain('fetchNextPage');
    expect(source).not.toContain('cursor');
    expect(source).not.toContain('offset');
  });
});
