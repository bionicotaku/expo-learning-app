# Video Entity

`entities/video` 定义 source-agnostic 的 canonical video truth。

当前职责：

- `model/types.ts`
  - `VideoListItem`
- `model/map-feed-item-to-video-list-item.ts`
  - `FeedItem -> VideoListItem`
- `model/find-video-list-item-index.ts`
  - 按 `videoId` 查 canonical item 的 index
- `model/mock-clip-catalog.ts`
  - 当前 feed / transcript mock 共用的 clip 资源目录

边界约束：

- 这里只描述视频本体字段和 source-agnostic helper
- 不放 React Query source cache
- 不放 `videoId -> runtime override`
- 不放页面上下文或 fullscreen 会话态
