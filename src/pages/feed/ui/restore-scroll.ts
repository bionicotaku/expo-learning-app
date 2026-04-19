export type FeedRestoreScrollParams = {
  animated: true;
  index: number;
  viewPosition: number;
};

export function buildFeedRestoreScrollParams(index: number): FeedRestoreScrollParams {
  return {
    animated: true,
    index,
    viewPosition: 0.08,
  };
}
