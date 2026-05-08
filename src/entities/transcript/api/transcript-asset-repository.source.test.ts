import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('transcript asset repository source', () => {
  it('prepares transcript playback timing after dto mapping and before returning query data', () => {
    const source = readFileSync(
      new URL('./transcript-asset-repository.ts', import.meta.url).pathname,
      'utf8'
    );

    expect(source).toContain('prepareTranscriptForPlayback');
    expect(source).toContain('mapTranscriptDtoToDomain');
    expect(source.indexOf('mapTranscriptDtoToDomain')).toBeLessThan(
      source.indexOf('prepareTranscriptForPlayback')
    );
  });
});
