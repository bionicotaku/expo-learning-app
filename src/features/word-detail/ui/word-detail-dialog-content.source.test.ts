import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('word detail dialog content source', () => {
  it('renders title, optional subtitle, and caller-provided sections without fixed semantic fields', () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        'src/features/word-detail/ui/word-detail-dialog-content.tsx'
      ),
      'utf8'
    );

    expect(source).toContain('WordDetailDialogData');
    expect(source).toContain('WordDetailDialogSection');
    expect(source).toContain('WordDetailAudioClip');
    expect(source).toContain('WordDetailDialogAudio');
    expect(source).toContain('title: string');
    expect(source).toContain('subtitle?: string');
    expect(source).toContain('audio?: WordDetailDialogAudio');
    expect(source).toContain('sections: WordDetailDialogSection[]');
    expect(source).toContain('payload.title');
    expect(source).toContain('payload.subtitle ?');
    expect(source).toContain('payload.sections.map');
    expect(source).toContain('WordDetailAudioControls');
    expect(source).toContain('WordDetailAudioButton');
    expect(source).toContain('WordDetailHeadlessAudioPlayer');
    expect(source).toContain('WordDetailFavoriteButton');
    expect(source).toContain('payload.audio ?');
    expect(source).toContain('播放单词音频');
    expect(source).toContain('播放本句音频');
    expect(source).toContain('badgeLabel');
    expect(source).toContain('词');
    expect(source).toContain('句');
    expect(source).toContain('speaker.wave.2.fill');
    expect(source).toContain("toast.show({");
    expect(source).toContain("kind: 'error'");
    expect(source).toContain('音频加载失败');
    expect(source).toContain('收藏单词');
    expect(source).toContain('取消收藏单词');
    expect(source).toContain('section.id');
    expect(source).toContain('section.title');
    expect(source).toContain('section.body');
    expect(source).not.toContain('showLearningFeedbackActions');
    expect(source).not.toContain('WordDetailLearningFeedbackActions');
    expect(source).not.toContain('认识');
    expect(source).not.toContain('模糊');
    expect(source).not.toContain('不认识');
    expect(source).not.toContain('sentenceAudio');
    expect(source).not.toContain('WordDetailSentenceAudio');
    expect(source).not.toContain('speaker.wave.1.fill');
    expect(source).not.toContain('semantic_element');
    expect(source).not.toContain('base_form');
    expect(source).not.toContain('coarse_id');
    expect(source).not.toContain('display?:');
    expect(source).not.toContain('showBaseForm');
    expect(source).not.toContain('explanationTitle');
    expect(source).not.toContain('payload.explanation');
    expect(source).not.toContain('payload.semantic_element');
    expect(source).not.toContain('上下文释义');
    expect(source).not.toContain('字典释义');
    expect(source).not.toContain('reason');
    expect(source).not.toContain('onDismiss');
    expect(source).not.toContain('Close');
    expect(source).not.toContain('Close word detail');
    expect(source).not.toContain('<RaisedSurface');
    expect(source).not.toContain("tone=\"background\"");
  });
});
