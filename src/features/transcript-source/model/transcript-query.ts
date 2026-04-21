export function getTranscriptQueryKey(videoId: string) {
  return ['transcript', videoId] as const;
}
