# Video Entity

`entities/video` 定义前端列表、详情和 fullscreen 共用的视频消费模型。

当前职责：

- `model/types.ts`
  - `VideoListItem`
  - `VideoLearningUnit`
- `model/map-feed-item-to-video-list-item.ts`
  - `mapFeedItemToVideoListItem(item, recommendationRunId)`
  - 唯一 `FeedItem -> VideoListItem` 映射入口
- `model/find-video-list-item-index.ts`
  - 按 `videoId` 查 canonical item 的 index
- `model/mock-clip-catalog.ts`
  - 当前 feed / video-meta mock 共用的 clip 资源目录

边界约束：

- 这里只描述前端可消费的视频列表字段和 helper
- `VideoListItem` 当前包含视频展示字段、`recommendationRunId` 和 `learningUnits`
- 不放 React Query source cache
- 不放 `videoId -> runtime override`
- 不放当前用户的 `isLiked / isFavorited`
- 不放页面上下文或 fullscreen 会话态
