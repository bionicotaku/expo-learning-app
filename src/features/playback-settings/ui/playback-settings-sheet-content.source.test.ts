import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('playback settings sheet content source', () => {
  it('renders the playback rate toggle and inactive action buttons', () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        'src/features/playback-settings/ui/playback-settings-sheet-content.tsx'
      ),
      'utf8'
    );

    expect(source).toContain('SegmentedFilterBar');
    expect(source).toContain('Switch');
    expect(source).toContain('PLAYBACK_RATE_OPTIONS');
    expect(source).toContain('useVideoDetailsVisible');
    expect(source).toContain('useSetVideoDetailsVisible');
    expect(source).toContain('videoDetailsVisible');
    expect(source).toContain('setVideoDetailsVisible');
    expect(source).toContain("label: '0.5'");
    expect(source).toContain("label: '1.0'");
    expect(source).toContain("label: '1.5'");
    expect(source).toContain("label: '2.0'");
    expect(source).not.toContain('0.5x');
    expect(source).not.toContain('1.0x');
    expect(source).not.toContain('1.5x');
    expect(source).not.toContain('2.0x');
    expect(source).toContain('倍速');
    expect(source).not.toContain('视频信息');
    expect(source).toContain('显示视频标题和简介');
    expect(source).toContain('value={videoDetailsVisible}');
    expect(source).toContain('onValueChange={setVideoDetailsVisible}');
    expect(source).toContain('accessibilityLabel="显示视频标题和简介"');
    expect(source).toContain('name="text.alignleft"');
    expect(source).toContain('fallbackGlyph="T"');
    expect(source).toContain('分享');
    expect(source).toContain('测试题');
    expect(source).toContain('反馈');
    expect(source.indexOf('倍速')).toBeLessThan(
      source.indexOf('显示视频标题和简介')
    );
    expect(source.indexOf('显示视频标题和简介')).toBeLessThan(
      source.indexOf('{actionItems.map')
    );
    expect(source.indexOf('倍速')).toBeLessThan(
      source.indexOf("label: '测试题'")
    );
    expect(source.indexOf("label: '测试题'")).toBeLessThan(
      source.indexOf("label: '分享'")
    );
    expect(source.indexOf("label: '分享'")).toBeLessThan(
      source.indexOf("label: '反馈'")
    );
    expect(source).not.toContain('Playback settings');
    expect(source).not.toContain('Default speed');
    expect(source).not.toContain('EditorialTitle');
    expect(source).not.toContain('MetaLabel');
    expect(source).not.toContain('<RaisedSurface\n                radius={14}');
    expect(source).toContain('function createPlaybackSettingsRowStyle');
    expect(source).toContain('createPlaybackSettingsRowStyle(tokens)');
    expect(source).toContain('function PlaybackSettingsRowSeparator');
    expect(source).toContain('<PlaybackSettingsRowSeparator tokens={tokens} />');
    expect(source).toContain('height: 1');
    expect(source).toContain('accessibilityRole="button"');
    expect(source).toContain('onPress={() => {}}');
    expect(source).not.toContain('router.');
    expect(source).not.toContain('toast.');
    expect(source).not.toContain('fetch(');
    expect(source).not.toContain('Share.share');
  });
});
