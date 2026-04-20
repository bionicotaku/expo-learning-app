import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const source = readFileSync(
  decodeURIComponent(new URL('./playback-feedback.ts', import.meta.url).pathname),
  'utf8'
);

describe('playback feedback source', () => {
  it('does not keep playback toggle toast state in the feedback union', () => {
    expect(source).not.toContain("kind: 'playback'");
    expect(source).not.toContain('createPlaybackToggleFeedback');
  });
});
