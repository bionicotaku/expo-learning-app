import { existsSync, readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const pagePath = new URL('./word-list-page.tsx', import.meta.url).pathname;

describe('word list page source', () => {
  it('renders the hardcoded Word List UI without live favorite data or runtime calls', () => {
    expect(existsSync(pagePath)).toBe(true);

    const source = readFileSync(pagePath, 'utf8');

    expect(source).toContain('ScrollView');
    expect(source).toContain('SegmentedFilterBar');
    expect(source).toContain('WordCard');
    expect(source).toContain('单词列表');
    expect(source).toContain('Learning shelf');
    expect(source).toContain('未学习');
    expect(source).toContain('已学习');
    expect(source).toContain('收藏夹');

    expect(source).toContain('carry weight');
    expect(source).toContain('/ˈkæri weɪt/');
    expect(source).toContain(
      'to sound meaningful because the speaker or source gives the sentence authority.'
    );
    expect(source).toContain('land on');
    expect(source).toContain('/lænd ɒn/');
    expect(source).toContain(
      'to arrive at an answer, phrase, or idea that finally feels right.'
    );
    expect(source).toContain('read the room');
    expect(source).toContain('/riːd ðə ruːm/');
    expect(source).toContain('to understand the atmosphere before you speak.');

    expect(source).toContain('onPress={noopAction}');
    expect(source).toContain('star.fill');
    expect(source).not.toContain('useVideoRuntimeState');
    expect(source).not.toContain('router.');
    expect(source).not.toContain('fetch(');
    expect(source).not.toContain('signOut');
  });
});
