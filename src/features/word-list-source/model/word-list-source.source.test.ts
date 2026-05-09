import { existsSync, readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const hookPath = new URL('./use-unlearned-word-list-source.ts', import.meta.url).pathname;
const queryPath = new URL('./word-list-query.ts', import.meta.url).pathname;
const mapperPath = new URL('./mappers.ts', import.meta.url).pathname;

describe('word list source boundaries', () => {
  it('keeps infinite-query pagination in the feature layer and out of the page', () => {
    expect(existsSync(hookPath)).toBe(true);
    expect(existsSync(queryPath)).toBe(true);
    expect(existsSync(mapperPath)).toBe(true);

    const source = [
      readFileSync(hookPath, 'utf8'),
      readFileSync(queryPath, 'utf8'),
      readFileSync(mapperPath, 'utf8'),
    ].join('\n');

    expect(source).toContain('useInfiniteQuery');
    expect(source).toContain("['word-list-source', 'unlearned']");
    expect(source).toContain('fetchMockUnlearnedUnitProgressPage');
    expect(source).toContain('queryClient.setQueryData');
    expect(source).toContain('fetchNextPage');
    expect(source).toContain("toast.show({");
    expect(source).toContain("chineseLabel: item.chineseLabel ?? ''");
    expect(source).not.toContain('pages/word-list');
    expect(source).not.toContain('query.refetch()');
    expect(source).not.toContain('fetch(');
  });
});
