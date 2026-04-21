import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('fullscreen transcript source hook source', () => {
  it('keeps the transcript query cache contract and avoids runtime-store coupling', () => {
    const source = readFileSync(
      new URL('./use-fullscreen-transcript-source.ts', import.meta.url).pathname,
      'utf8'
    );

    expect(source).toContain('useQuery');
    expect(source).toContain('useQueryClient');
    expect(source).toContain('prefetchQuery');
    expect(source).toContain('enabled: activeVideoId !== null');
    expect(source).toContain('staleTime: Infinity');
    expect(source).toContain('gcTime: 30 * 60 * 1000');
    expect(source).toContain('refetchOnMount: false');
    expect(source).toContain('refetchOnReconnect: false');
    expect(source).toContain('refetchOnWindowFocus: false');
    expect(source).toContain('retry: false');
    expect(source).toContain('catch(() => undefined)');
    expect(source).not.toContain('placeholderData');
    expect(source).not.toContain('keepPreviousData');
    expect(source).not.toContain('useVideoRuntimeStore');
  });
});
