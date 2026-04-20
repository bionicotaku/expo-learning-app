import { describe, expect, it } from 'vitest';

import { getTranscriptQueryKey } from './transcript-query';

describe('transcript query', () => {
  it('builds a stable query key from videoId', () => {
    expect(getTranscriptQueryKey('video-1')).toEqual(['transcript', 'video-1']);
    expect(getTranscriptQueryKey('video-9')).toEqual(['transcript', 'video-9']);
    expect(getTranscriptQueryKey('video-1')).not.toEqual(getTranscriptQueryKey('video-9'));
  });
});
