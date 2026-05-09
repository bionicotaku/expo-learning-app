import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const entityRoot = new URL('..', import.meta.url).pathname;
const repositoryPath = join(entityRoot, 'api/unit-progress-repository.ts');
const indexPath = join(entityRoot, 'index.ts');

describe('learning unit progress API source boundaries', () => {
  it('keeps the API repository isolated from UI and React Query wiring', () => {
    expect(existsSync(repositoryPath)).toBe(true);
    expect(existsSync(indexPath)).toBe(true);

    const repositorySource = readFileSync(repositoryPath, 'utf8');
    const indexSource = readFileSync(indexPath, 'utf8');
    const combinedSource = `${repositorySource}\n${indexSource}`;

    expect(combinedSource).toContain('requestJson');
    expect(combinedSource).toContain("auth: 'required'");
    expect(combinedSource).toContain('/learning/unit-progress/unmastered');
    expect(combinedSource).toContain('/learning/unit-progress/mastered');
    expect(combinedSource).toContain('fetchUnlearnedUnitProgressPage');
    expect(combinedSource).toContain('fetchLearnedUnitProgressPage');
    expect(combinedSource).not.toContain('pages/word-list');
    expect(combinedSource).not.toContain('@tanstack/react-query');
    expect(combinedSource).not.toContain('useQuery');
    expect(combinedSource).not.toContain('useInfiniteQuery');
    expect(combinedSource).not.toContain('fetch(');
    expect(combinedSource).not.toContain('display_text');
  });
});
