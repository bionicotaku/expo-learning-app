# Feed API 设计

## 1. 文档目标

本文档定义当前 `feed` 列表读取接口。它只描述列表 source 返回什么，不描述当前用户对某个视频的实时状态。

相关文档：

- [Video Meta API设计](./Video%20Meta%20API%E8%AE%BE%E8%AE%A1.md)
- [Video 真值与 Runtime 设计规范](./Video%20真值与%20Runtime%20设计规范.md)

## 2. 核心结论

当前 feed API 固定为：

- `GET /feed`
- 不接受 `offset / limit / cursor / page`
- 返回 `{ items: FeedItem[] }`
- 每次返回多少条由服务端决定；当前 mock 每次返回 8 条
- feed item 不再包含 `isLiked / isFavorited`
- feed item 包含 `likeCount / favoriteCount`，供 fullscreen action rail 展示基础统计数

当前用户态读取属于 `Video Meta API`，不属于 feed。

## 3. 响应契约

```ts
type FeedResponse = {
  items: FeedItem[];
};

type FeedItem = {
  videoId: string;
  title: string;
  description: string;
  videoUrl: string;
  coverImageUrl?: string | null;
  durationSeconds: number;
  viewCount: number;
  likeCount: number;
  favoriteCount: number;
  tags: string[];
};
```

字段语义：

- `videoId`：视频稳定标识，用于列表 key、路由和 fullscreen 定位。
- `title / description`：视频基础文案。
- `videoUrl / coverImageUrl`：播放资源和封面资源。
- `durationSeconds / viewCount`：基础展示统计。
- `likeCount / favoriteCount`：全局统计数；fullscreen action rail 会在当前用户写入 like / favorite 时派生展示值，但不会把派生值写回 feed truth，也不要求写 API 返回 count。
- `tags`：卡片标签来源。

## 4. 前端映射

当前前端读取链：

```txt
FeedResponse.items
-> mapFeedItemToVideoListItem()
-> VideoListItem[]
-> FeedPage / VideoDetailPage / FullscreenVideoPager
```

`VideoListItem` 是 source-agnostic 的视频列表真值。它保留 feed 返回的视频本体和统计字段，但不包含当前用户态。

## 5. Mock 规则

当前 mock feed：

- 使用共享 mock clip catalog 生成 `videoUrl / coverImageUrl`
- 使用递增 `videoId` 模拟无状态 batch 续接
- 按 `videoId` 稳定生成 `title / description / viewCount / likeCount / favoriteCount / tags`
- `likeCount / favoriteCount` 当前稳定落在 `8000..12000`
- 不生成 `isLiked / isFavorited`

当前用户态 mock 已移动到 `entities/video-meta`。
