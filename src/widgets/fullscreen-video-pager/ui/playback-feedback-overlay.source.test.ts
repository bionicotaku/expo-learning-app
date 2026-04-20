import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const source = readFileSync(
  decodeURIComponent(new URL('./playback-feedback-overlay.tsx', import.meta.url).pathname),
  'utf8'
);

describe('PlaybackFeedbackOverlay source', () => {
  it('renders seek and rate HUDs with dedicated glass icon treatments instead of playback text toasts', () => {
    expect(source).toContain('backward.fill');
    expect(source).toContain('forward.fill');
    expect(source).toContain('speedometer');
    expect(source).toContain('FadeIn');
    expect(source).toContain('FadeOut');
    expect(source).toContain("top: '15%'");
    expect(source).not.toContain('Playing');
    expect(source).not.toContain('Paused');
  });
});
