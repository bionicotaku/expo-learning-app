import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('useVideoEngagementState source', () => {
  it('owns engagement mutations, optimistic runtime updates, rollback, and toast feedback', () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        'src/features/video-engagement/model/use-video-engagement-state.ts'
      ),
      'utf8'
    );

    expect(source).toContain('useMutation');
    expect(source).toContain('useVideoRuntimeState');
    expect(source).toContain('resolveEffectiveEngagementCount');
    expect(source).toContain('setVideoLiked');
    expect(source).toContain('setVideoFavorited');
    expect(source).toContain('toast.show');
    expect(source).toContain('点赞失败');
    expect(source).toContain('取消点赞失败');
    expect(source).toContain('收藏失败');
    expect(source).toContain('取消收藏失败');
    expect(source).toContain('likePendingRef');
    expect(source).toContain('favoritePendingRef');
    expect(source).not.toContain('invalidateQueries');
    expect(source).not.toContain('setQueryData');
  });
});
