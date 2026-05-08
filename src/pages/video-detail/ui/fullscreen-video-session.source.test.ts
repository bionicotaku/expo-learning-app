import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('fullscreen video session source', () => {
  it('owns fullscreen resource input and near-tail requestMore handling for the fullscreen session', () => {
    const source = readFileSync(
      new URL('./fullscreen-video-session.tsx', import.meta.url).pathname,
      'utf8'
    );

    expect(source).toContain('useFullscreenVideoResources');
    expect(source).toContain('videoMetaByVideoId');
    expect(source).not.toContain('useFullscreenTranscriptSource');
    expect(source).toContain('usePresentPlaybackSettingsSheet');
    expect(source).toContain('createTailRequestGate');
    expect(source).toContain('requestMoreForTail');
    expect(source).toContain('requestMore');
    expect(source).toContain('onActiveVideoChange');
    expect(source).toContain('onCenterHoldStart={presentPlaybackSettingsSheet}');
    expect(source).toContain('pagerReportedActive');
    expect(source).toContain('entryVideoId');
    expect(source).toContain('entryIndex');
    expect(source).not.toContain('lastRequestedTailVideoIdRef');
    expect(source).not.toContain('useVideoRuntimeStore');
    expect(source).not.toContain('routeVideoId');
    expect(source).not.toContain('pendingRestoreVideoId');
  });
});
