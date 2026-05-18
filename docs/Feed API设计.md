# Feed API 设计

## 1. 文档目标

本文档定义前端当前消费的 Feed API 契约。前端仍使用 mock repository，不接真实网络，但 mock payload、类型和映射边界必须对齐后端最新 `POST /api/feed` 响应。

相关文档：

- [Video Meta API设计](./Video%20Meta%20API%E8%AE%BE%E8%AE%A1.md)
- [Video 真值与 Runtime 设计规范](./Video%20真值与%20Runtime%20设计规范.md)

## 2. 核心结论

当前 feed API 固定为：

- `POST /api/feed`
- 前端当前不传分页参数；每次返回多少条由后端决定
- 响应顶层包含 `recommendation_run_id`
- `items[]` 是本轮推荐返回的视频列表
- 每个 item 包含视频展示字段和 `learning_units`
- feed item 不包含当前用户态 `is_liked / is_favorited`
- feed item 不包含 `tags`
- feed item 不暴露推荐系统内部字段：`rank / score / reason_codes / explanation / selector_mode / underfilled`

当前用户态读取属于 `Video Meta API`，不属于 feed。

## 3. 响应契约

```ts
type FeedLearningUnitRole =
  | 'hard_review'
  | 'new_now'
  | 'soft_review'
  | 'near_future';

type FeedLearningUnit = {
  coarse_unit_id: number;
  text: string;
  role: FeedLearningUnitRole;
  is_primary: boolean;
  evidence_sentence_index: number;
  evidence_span_index: number;
  evidence_start_ms: number;
  evidence_end_ms: number;
};

type FeedItem = {
  video_id: string;
  title: string;
  description: string;
  video_url: string;
  cover_image_url: string | null;
  duration_seconds: number;
  view_count: number;
  like_count: number;
  favorite_count: number;
  learning_units: FeedLearningUnit[];
};

type FeedResponse = {
  recommendation_run_id: string;
  items: FeedItem[];
};
```

字段语义：

- `recommendation_run_id`：本次 feed 响应的推荐运行 ID。前端不展示它，只随 `VideoListItem` 传递，供后续 exposure / lookup / quiz 等上报关联审计。
- `items`：本次 feed 返回的视频列表。
- `video_id`：视频稳定标识，用于列表 key、路由、fullscreen 定位和后续上报。
- `title / description`：视频基础文案。
- `video_url / cover_image_url`：播放资源和封面资源。
- `duration_seconds / view_count`：基础展示统计。
- `like_count / favorite_count`：全局统计数；fullscreen action rail 会在当前用户写入 like / favorite 时派生展示值，但不会把派生值写回 feed truth。
- `learning_units`：本轮 feed 希望用户在该视频里学习或复习的 learning unit 列表。它属于本轮 feed learning context，而不是视频永久元数据。
- `coarse_unit_id`：learning unit 的稳定 ID。
- `text`：前端可直接展示的学习单元文本。
- `role`：该 learning unit 在本轮推荐里的学习角色。
- `is_primary`：该视频本轮最主要的 learning unit 标记。
- `evidence_sentence_index / evidence_span_index`：learning unit 在 transcript evidence 中对应的句子和 span 索引。
- `evidence_start_ms / evidence_end_ms`：evidence 在视频内的时间范围，单位毫秒。

## 4. 前端映射

当前前端读取链：

```txt
FeedResponse
-> mapFeedItemToVideoListItem(item, recommendation_run_id)
-> VideoListItem[]
-> FeedPage / VideoDetailPage / FullscreenVideoPager
```

`entities/feed` 保持后端响应 shape，字段使用 snake_case。`entities/video` 输出前端消费模型，字段使用 camelCase。

`VideoListItem` 直接携带：

- 视频展示字段
- `recommendationRunId`
- `learningUnits`

当前不另建 plan registry，也不把推荐解释、排序分数或 reason code 暴露给前端 UI。

## 5. Mock 规则

当前 mock feed：

- 仍使用共享 mock clip catalog 生成 `video_url / cover_image_url`
- 每次 mock response 返回 8 条 item
- 使用递增 UUID 形态 `video_id` 模拟无状态 batch 续接
- 8 条 Office clip 资产循环复用；第二批 `video-9..16` 继续复用 `clip1..8` 的资源和 learning units
- `duration_seconds` 按 clip 的 `buffered_end_time - buffered_start_time` 向上取整，保证 learning unit evidence 落在视频时长内
- 每个 response 生成一个稳定 `recommendation_run_id`，同一 response 的所有 item 共用
- `learning_units` 直接静态复制自本地 Office clip learning unit JSON 内容，不在运行时读取外部文件
- `like_count / favorite_count` 当前稳定落在 `8000..12000`
- 不生成 `is_liked / is_favorited`

当前用户态 mock 已移动到 `entities/video-meta`。
