import { existsSync, readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const pagedHookPath = new URL('./use-paged-word-list-source.ts', import.meta.url).pathname;
const unlearnedHookPath = new URL('./use-unlearned-word-list-source.ts', import.meta.url).pathname;
const learnedHookPath = new URL('./use-learned-word-list-source.ts', import.meta.url).pathname;
const emptyHookPath = new URL('./use-empty-word-list-source.ts', import.meta.url).pathname;
const queryPath = new URL('./word-list-query.ts', import.meta.url).pathname;
const mapperPath = new URL('./mappers.ts', import.meta.url).pathname;

describe('word list source boundaries', () => {
  it('keeps infinite-query pagination in the feature layer and out of the page', () => {
    expect(existsSync(pagedHookPath)).toBe(true);
    expect(existsSync(unlearnedHookPath)).toBe(true);
    expect(existsSync(learnedHookPath)).toBe(true);
    expect(existsSync(emptyHookPath)).toBe(true);
    expect(existsSync(queryPath)).toBe(true);
    expect(existsSync(mapperPath)).toBe(true);

    const source = [
      readFileSync(pagedHookPath, 'utf8'),
      readFileSync(unlearnedHookPath, 'utf8'),
      readFileSync(learnedHookPath, 'utf8'),
      readFileSync(emptyHookPath, 'utf8'),
      readFileSync(queryPath, 'utf8'),
      readFileSync(mapperPath, 'utf8'),
    ].join('\n');

    expect(source).toContain('useInfiniteQuery');
    expect(source).toContain("['word-list-source', 'unlearned']");
    expect(source).toContain("['word-list-source', 'learned']");
    expect(source).toContain('fetchMockUnlearnedUnitProgressPage');
    expect(source).toContain('fetchMockLearnedUnitProgressPage');
    expect(source).toContain('queryClient.setQueryData');
    expect(source).toContain('query.refetch()');
    expect(source).toContain('fetchNextPage');
    expect(source).toContain("toast.show({");
    expect(source).toContain("chineseLabel: item.chineseLabel ?? ''");
    expect(readFileSync(emptyHookPath, 'utf8')).not.toContain('learning-unit-progress');
    expect(source).not.toContain('pages/word-list');
    expect(source).not.toMatch(/\bfetch\s*\(/);
  });
});
