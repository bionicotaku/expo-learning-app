export type FullscreenRowTransientFeedback =
  | {
      deltaSeconds: -5 | 5;
      kind: 'seek';
    }
  | {
      kind: 'rate';
      label: '2x';
    };

export type FullscreenRowPlaybackHudState = {
  pauseIndicatorVisible: boolean;
  transientFeedback: FullscreenRowTransientFeedback | null;
};

export type FullscreenRowPlaybackHudStateByVideoId = Record<
  string,
  FullscreenRowPlaybackHudState | undefined
>;

const emptyHudState: FullscreenRowPlaybackHudState = {
  pauseIndicatorVisible: false,
  transientFeedback: null,
};

function pruneIfEmpty(
  store: FullscreenRowPlaybackHudStateByVideoId,
  videoId: string
): FullscreenRowPlaybackHudStateByVideoId {
  const currentState = store[videoId];
  if (!currentState) {
    return store;
  }

  if (currentState.pauseIndicatorVisible || currentState.transientFeedback) {
    return store;
  }

  const nextStore = { ...store };
  delete nextStore[videoId];
  return nextStore;
}

function updateHudState(
  store: FullscreenRowPlaybackHudStateByVideoId,
  videoId: string,
  updater: (currentState: FullscreenRowPlaybackHudState) => FullscreenRowPlaybackHudState
): FullscreenRowPlaybackHudStateByVideoId {
  const nextStore: FullscreenRowPlaybackHudStateByVideoId = {
    ...store,
    [videoId]: updater(store[videoId] ?? emptyHudState),
  };

  return pruneIfEmpty(nextStore, videoId);
}

export function getFullscreenRowPlaybackHudState(
  store: FullscreenRowPlaybackHudStateByVideoId,
  videoId: string
): FullscreenRowPlaybackHudState {
  return store[videoId] ?? emptyHudState;
}

export function showFullscreenRowPauseIndicator(
  store: FullscreenRowPlaybackHudStateByVideoId,
  videoId: string
): FullscreenRowPlaybackHudStateByVideoId {
  return updateHudState(store, videoId, (currentState) => ({
    ...currentState,
    pauseIndicatorVisible: true,
  }));
}

export function hideFullscreenRowPauseIndicator(
  store: FullscreenRowPlaybackHudStateByVideoId,
  videoId: string
): FullscreenRowPlaybackHudStateByVideoId {
  return updateHudState(store, videoId, (currentState) => ({
    ...currentState,
    pauseIndicatorVisible: false,
  }));
}

export function setFullscreenRowTransientFeedback(
  store: FullscreenRowPlaybackHudStateByVideoId,
  videoId: string,
  transientFeedback: FullscreenRowTransientFeedback
): FullscreenRowPlaybackHudStateByVideoId {
  return updateHudState(store, videoId, (currentState) => ({
    ...currentState,
    transientFeedback,
  }));
}

export function clearFullscreenRowTransientFeedback(
  store: FullscreenRowPlaybackHudStateByVideoId,
  videoId: string
): FullscreenRowPlaybackHudStateByVideoId {
  return updateHudState(store, videoId, (currentState) => ({
    ...currentState,
    transientFeedback: null,
  }));
}

export function clearFullscreenRowTransientFeedbackByKind(
  store: FullscreenRowPlaybackHudStateByVideoId,
  videoId: string,
  kind: FullscreenRowTransientFeedback['kind']
): FullscreenRowPlaybackHudStateByVideoId {
  return updateHudState(store, videoId, (currentState) => ({
    ...currentState,
    transientFeedback:
      currentState.transientFeedback?.kind === kind
        ? null
        : currentState.transientFeedback,
  }));
}

export function clearFullscreenRowPlaybackHudState(
  store: FullscreenRowPlaybackHudStateByVideoId,
  videoId: string
): FullscreenRowPlaybackHudStateByVideoId {
  const nextStore = { ...store };
  delete nextStore[videoId];
  return nextStore;
}
