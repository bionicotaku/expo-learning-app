export type FullscreenPlaybackFeedback =
  | {
      kind: 'rate';
      label: '2x';
    }
  | {
      deltaSeconds: -5 | 5;
      kind: 'seek';
    };

export function createSeekFeedback(
  deltaSeconds: -5 | 5
): FullscreenPlaybackFeedback {
  return {
    deltaSeconds,
    kind: 'seek',
  };
}

export function createRateFeedback(): FullscreenPlaybackFeedback {
  return {
    kind: 'rate',
    label: '2x',
  };
}

export function shouldAutoDismissPlaybackFeedback(
  feedback: FullscreenPlaybackFeedback
): boolean {
  return feedback.kind !== 'rate';
}
