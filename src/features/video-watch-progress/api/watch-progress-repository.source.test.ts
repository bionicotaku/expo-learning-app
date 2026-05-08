import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

function readSource(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url).pathname, 'utf8');
}

describe('watch progress API source boundaries', () => {
  it('keeps the facade mock-backed and free of direct network calls', () => {
    const source = readSource('./watch-progress-repository.ts');

    expect(source).toContain("from './mock-watch-progress-repository'");
    expect(source).toContain('reportMockVideoWatchProgress');
    expect(source).not.toContain('requestJson');
    expect(source).not.toContain('@tanstack/react-query');
    expect(source).not.toContain('@/shared/ui/toast');
    expect(source).not.toContain('fullscreen-video-pager');
    expect(source).not.toContain('expo-video');
  });

  it('keeps the mock always-successful and independent of catalog validation', () => {
    const source = readSource('./mock-watch-progress-repository.ts');

    expect(source).toContain('Promise<void>');
    expect(source).not.toContain('ApiError');
    expect(source).not.toContain('mock-clip-catalog');
    expect(source).not.toContain('throw');
  });
});
