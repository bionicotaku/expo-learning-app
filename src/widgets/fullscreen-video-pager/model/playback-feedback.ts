export function getPlaybackFeedbackLabel(pausedByUser: boolean): string {
  return pausedByUser ? 'Paused' : 'Playing';
}
