# Feed Entity

`entities/feed` 定义无状态 feed batch 的领域契约，而不是页面渲染态。

当前职责：

- `model/types.ts`
  - `FeedItem`
  - `FeedResponse`
- `api/feed-repository.ts`
  - feed 领域的公开读取入口
- `api/mock-feed-repository.ts`
  - 当前 MVP 的 mock feed batch 实现
  - 每次读取返回一批 item，不接受任何请求参数
  - 8 条真实 clip 的 `coverImageUrl` / `videoUrl` 作为循环复用的素材槽位
  - `coverImageUrl` 当前对齐到 `test-video/cover/...` 真实封面路径
  - `feed-repository` facade 默认保留 `2000ms` mock 延迟
  - 其余字段按 `videoId` 稳定伪随机派生

边界约束：

- 这里只描述 feed 数据和 feed 数据读取
- 不放卡片 tone、封面 fallback 状态、overlay 文案布局
- 不放播放状态、静音状态、可见项判定

当前这里仍然是 mock repository，但接口语义已经对齐无状态读取的真实异步 feed。
