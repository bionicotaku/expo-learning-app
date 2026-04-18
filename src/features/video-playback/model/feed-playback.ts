export type FeedPlaybackState = {
  activeItemId: string | null;
  activeIndex: number;
  isMuted: boolean;
};

export type FeedPlaybackAction =
  | {
      type: 'set-active-item';
      itemId: string;
      index: number;
    }
  | {
      type: 'toggle-muted';
    };

export function createFeedPlaybackState(): FeedPlaybackState {
  return {
    activeItemId: null,
    activeIndex: 0,
    isMuted: true,
  };
}

export function feedPlaybackReducer(
  state: FeedPlaybackState,
  action: FeedPlaybackAction
): FeedPlaybackState {
  switch (action.type) {
    case 'set-active-item':
      return {
        ...state,
        activeItemId: action.itemId,
        activeIndex: action.index,
      };
    case 'toggle-muted':
      return {
        ...state,
        isMuted: !state.isMuted,
      };
    default:
      return state;
  }
}
