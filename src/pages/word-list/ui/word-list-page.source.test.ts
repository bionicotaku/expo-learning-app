import { existsSync, readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const pagePath = new URL('./word-list-page.tsx', import.meta.url).pathname;

describe('word list page source', () => {
  it('renders the hardcoded Word List UI as a virtualized dense list without live favorite data or runtime calls', () => {
    expect(existsSync(pagePath)).toBe(true);

    const source = readFileSync(pagePath, 'utf8');

    expect(source).toContain('FlatList');
    expect(source).toContain('initialNumToRender={12}');
    expect(source).toContain('maxToRenderPerBatch={12}');
    expect(source).toContain('removeClippedSubviews');
    expect(source).toContain('windowSize={9}');
    expect(source).toContain('ItemSeparatorComponent={WordRowSeparator}');
    expect(source).toContain("borderStyle: 'dashed'");
    expect(source).toContain('type WordListPageProps');
    expect(source).toContain('showFavoriteAction');
    expect(source).toContain('showProgress');
    expect(source).toContain('showFavoriteAction = true');
    expect(source).toContain('showProgress = true');
    expect(source).toContain('SegmentedFilterBar');
    expect(source).toContain('WordRow');
    expect(source).toContain('RaisedSurface');
    expect(source).toContain('radius="pill"');
    expect(source).toContain('height: 30');
    expect(source).toContain('width: 30');
    expect(source).toContain('单词列表');
    expect(source).toContain('Learning shelf');
    expect(source).toContain('未学习');
    expect(source).toContain('已学习');
    expect(source).toContain('收藏夹');

    expect(source).toContain('carry weight');
    expect(source).toContain("partOfSpeech: 'verb'");
    expect(source).toContain(
      'to sound meaningful because the speaker or source gives the sentence authority.'
    );
    expect(source).toContain('land on');
    expect(source).toContain(
      'to arrive at an answer, phrase, or idea that finally feels right.'
    );
    expect(source).toContain('read the room');
    expect(source).toContain('to understand the atmosphere before you speak.');
    expect(source).toContain('resolvePartOfSpeechLabel');
    expect(source).toContain("WordPartOfSpeech | ''");
    expect(source).toContain("case '':");
    expect(source).toContain('partOfSpeechLabel ?');
    expect(source).toContain('resolveProgressColor');
    expect(source).toContain('mixHexColor');
    expect(source).toContain('parseHexColor');
    expect(source).toContain('rgbToHex');
    expect(source).toContain('const favoriteColor = tokens.color.softAction.rose;');
    expect(source).toContain('tokens.color.softAction.peach');
    expect(source).toContain('tokens.color.softAction.butter');
    expect(source).toContain('tokens.color.softAction.pistachio');
    expect(source).toContain('normalizedProgress / 50');
    expect(source).toContain('(normalizedProgress - 50) / 50');
    expect(source).toContain("return 'n.';");
    expect(source).toContain("return 'v.';");
    expect(source).toContain("return 'adj.';");
    expect(source).toContain("return 'adv.';");
    expect(source).toContain('ellipsizeMode="tail"');
    expect(source).toContain('numberOfLines={1}');
    expect(source).toContain('tokens.color.inkMute');
    expect(source).toContain('{showFavoriteAction ? (');
    expect(source).toContain('{showProgress ? (');
    expect(source).not.toContain('Switch');
    expect(source).not.toContain('WordListVisibilitySwitch');
    expect(source).not.toContain('显示收藏');
    expect(source).not.toContain('显示进度');
    expect(source).not.toContain('setShowFavoriteAction');
    expect(source).not.toContain('setShowProgress');
    expect(source).not.toContain('ipa');
    expect(source).not.toContain('/ˈkæri weɪt/');
    expect(source).not.toContain('/lænd ɒn/');
    expect(source).not.toContain('/riːd ðə ruːm/');
    expect(source).not.toContain('accentKey');
    expect(source).not.toContain('progress >= 80');
    expect(source).not.toContain('progress >= 50');

    expect(source).toContain('onPress={noopAction}');
    expect(source).toContain('star.fill');
    expect(source).not.toContain('useVideoRuntimeState');
    expect(source).not.toContain('router.');
    expect(source).not.toContain('fetch(');
    expect(source).not.toContain('signOut');
    expect(source).not.toContain('ScrollView');
  });
});
