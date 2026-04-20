import type { Transcript } from '../model/types';

import { fetchMockTranscript } from './mock-transcript-repository';

export async function fetchTranscript(videoId: string): Promise<Transcript> {
  return fetchMockTranscript(videoId);
}
