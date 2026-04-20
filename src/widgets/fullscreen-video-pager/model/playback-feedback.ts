export type FullscreenPlaybackFeedback =
  | {
      kind: 'playback';
      label: 'Paused' | 'Playing';
    }
  | {
      kind: 'rate';
      label: '2x';
    }
  | {
      deltaSeconds: -5 | 5;
      kind: 'seek';
    };

export function createPlaybackToggleFeedback(
  pausedByUser: boolean
): FullscreenPlaybackFeedback {
  return {
    kind: 'playback',
    label: pausedByUser ? 'Paused' : 'Playing',
  };
}

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

export function formatPlaybackFeedbackLabel(
  feedback: FullscreenPlaybackFeedback
): string {
  if (feedback.kind === 'seek') {
    return feedback.deltaSeconds > 0
      ? `+${feedback.deltaSeconds}s`
      : `${feedback.deltaSeconds}s`;
  }

  return feedback.label;
}

export function shouldAutoDismissPlaybackFeedback(
  feedback: FullscreenPlaybackFeedback
): boolean {
  return feedback.kind !== 'rate';
}
