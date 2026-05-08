import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('fullscreen video resources source', () => {
  it('uses video meta and transcript asset resources', () => {
    const source = readFileSync(
      new URL('./use-fullscreen-video-resources.ts', import.meta.url).pathname,
      'utf8'
    );

    expect(source).toContain('useQueries');
    expect(source).toContain('fetchVideoMeta');
    expect(source).toContain('fetchTranscriptAsset');
    expect(source).toContain('fetchTranscriptAsset(transcriptUrl, { signal })');
    expect(source).toContain('REQUEST_ABORTED');
    expect(source).toContain("import { toast } from '@/shared/lib/toast';");
    expect(source).toContain('getVideoMetaQueryKey');
    expect(source).toContain('getTranscriptAssetQueryKey');
    expect(source).toContain('resolveFullscreenVideoResourceTargetIds');
    expect(source).toContain('shouldRefetchFailedQueryOnMount');
    expect(source).toContain("query.state.status === 'error'");
    expect(source).toContain('视频数据获取失败');
    expect(source).toContain('字幕获取失败');
    expect(source).toContain('toastedFailureMarkersByKeyRef');
    expect(source).toContain('errorUpdatedAt');
    expect(source).toContain('failureCount');
    expect(source).toContain('transcriptUrl !== null');
    expect(source).not.toContain('fetchTranscript(');
    expect(source).not.toContain('useFullscreenTranscriptSource');
    expect(source).not.toContain('placeholderData');
    expect(source).not.toContain('keepPreviousData');
    expect(source).not.toContain('refetchOnMount: false');
  });
});
