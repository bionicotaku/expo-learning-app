import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const tabsDir = join(process.cwd(), 'src/app/(tabs)');
const routePath = join(tabsDir, 'word-list.tsx');
const saveRoutePath = join(tabsDir, 'save.tsx');
const layoutPath = join(tabsDir, '_layout.tsx');

describe('word list tab route source', () => {
  it('mounts WordListPage from the word-list route and removes the old save route', () => {
    expect(existsSync(routePath)).toBe(true);
    expect(existsSync(saveRoutePath)).toBe(false);

    const source = readFileSync(routePath, 'utf8');

    expect(source).toContain("import { WordListPage } from '@/pages/word-list';");
    expect(source).toContain('function WordListRoute');
    expect(source).toContain('<WordListPage />');
    expect(source).not.toContain('SavePage');
    expect(source).not.toContain('@/pages/save');
  });

  it('uses word-list as the NativeTabs trigger name instead of save', () => {
    const source = readFileSync(layoutPath, 'utf8');

    expect(source).toContain('<NativeTabs.Trigger name="word-list">');
    expect(source).toContain(
      '<NativeTabs.Trigger.Label hidden>Word List</NativeTabs.Trigger.Label>'
    );
    expect(source).not.toContain('<NativeTabs.Trigger name="save">');
    expect(source).not.toContain(
      '<NativeTabs.Trigger.Label hidden>Save</NativeTabs.Trigger.Label>'
    );
  });
});
