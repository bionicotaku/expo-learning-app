# Feed Entity

`entities/feed` 定义无状态 feed batch 的领域契约，而不是页面渲染态。

当前类型对齐后端 `POST /api/feed` 响应 shape，字段保持 snake_case。前端当前仍使用 mock repository，不接真实网络。

当前职责：

- `model/types.ts`
  - `FeedItem`
  - `FeedLearningUnit`
  - `FeedResponse`
- `api/feed-repository.ts`
  - feed 领域的公开读取入口
- `api/mock-feed-repository.ts`
  - 当前 MVP 的 mock feed batch 实现
  - 每次读取返回一批 item，不接受任何请求参数
  - 8 条真实 clip 的 `cover_image_url` / `video_url` 作为循环复用的素材槽位
  - `cover_image_url` 当前对齐到 `test-video/cover/...` 真实封面路径
  - `video_id` 使用 UUID 形态的递增 mock id，便于对齐后端契约
  - `duration_seconds` 来自 clip 的 buffered duration，保证 evidence 时间落在视频时长内
  - 每次 response 生成稳定 `recommendation_run_id`，同一 response 的 item 共用
  - `learning_units` 使用静态复制进源码的 Office clip learning unit 数据
  - `feed-repository` facade 默认保留 `2000ms` mock 延迟
  - `like_count / favorite_count` 等统计字段按 `video_id` 稳定伪随机派生，当前范围为 `8000..12000`

边界约束：

- 这里只描述 feed 数据和 feed 数据读取
- 不暴露 `rank / score / reason_codes / explanation` 等推荐系统内部字段
- 不生成 `tags`
- 不放卡片 tone、封面 fallback 状态、overlay 文案布局
- 不放播放状态、静音状态、可见项判定
- 不放当前用户的 `isLiked / isFavorited`；这些属于 `entities/video-meta`

当前这里仍然是 mock repository，但接口语义已经对齐无状态读取的真实异步 feed。
