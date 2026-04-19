export type FeedSessionState = {
  pendingRestoreVideoId: string | null;
};

const initialFeedSessionState: FeedSessionState = {
  pendingRestoreVideoId: null,
};

let feedSessionState: FeedSessionState = initialFeedSessionState;

export function getPendingRestoreVideoId(): string | null {
  return feedSessionState.pendingRestoreVideoId;
}

export function setPendingRestoreVideoId(videoId: string | null) {
  feedSessionState = {
    pendingRestoreVideoId: videoId,
  };
}

export function clearPendingRestoreVideoId() {
  feedSessionState = {
    pendingRestoreVideoId: null,
  };
}

export function resetFeedSession() {
  feedSessionState = initialFeedSessionState;
}
