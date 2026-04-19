# Feed Entity

`entities/feed` 定义 feed 领域本身，而不是页面渲染态。

当前职责：

- `model/types.ts`
  - `FeedItem`
  - `FeedPageResult`
- `api/mock-feed-repository.ts`
  - mock feed 分页读取
  - 5 个底层视频资源的轮转映射

边界约束：

- 这里只描述 feed 数据和 feed 数据读取
- 不放 loading tail、debug 徽标、overlay 文案这类页面渲染态
- 不放播放状态、静音状态、可见项判定

当前 MVP 阶段这里仍然是 mock repository，但接口语义按真实异步分页实现。
